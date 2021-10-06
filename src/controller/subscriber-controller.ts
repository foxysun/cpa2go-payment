import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AWSError, DynamoDB } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { get as _get, isEmpty as _isEmpty, keys as _keys, map as _map } from 'lodash';
import { verifyReceipt } from '../service/apple-service';
import IAppleVerifyResponse from '../types/iap/apple-response';
import IReceiptData from '../types/iap/receipt-data';
import { failure, success } from '../utils/http-response';
import AbstractController from './abstract-controller';

class SubscriberController extends AbstractController {
  private dynamoDB: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();

  public main(): APIGatewayProxyResultV2 {
    return success({ db: process.env.SUBSCRIPTION_TABLE_NAME });
  }

  private async getSubscriber(userId: string): Promise<DynamoDB.DocumentClient.GetItemOutput> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: process.env.SUBSCRIBER_TABLE_NAME as string,
      Key: {
        userId
      }
    };
    const result: PromiseResult<DynamoDB.DocumentClient.GetItemOutput, AWSError> = await this.dynamoDB.get(params).promise();
    
    return _get(result, 'Item', {});
  }

  private async putToDB(userId: string): Promise<DynamoDB.DocumentClient.PutItemOutput> {
    const expiredDate: Date = new Date();
    expiredDate.setDate(expiredDate.getDate() + 30);

    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.SUBSCRIBER_TABLE_NAME as string,
      Item: {
        userId,
        subscribedAt: Date.now(),
        expiredDate: expiredDate.getTime(),
        ...this.body
      }
    };

    await this.dynamoDB.put(params).promise();

    return params.Item;
  }

  private async updateItemDB(userId: string): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {
    const keys: string[] = _keys(this.body);
    const expiredDate: Date = new Date();
    expiredDate.setDate(expiredDate.getDate() + 30);
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.SUBSCRIBER_TABLE_NAME as string,
      Key: {
        userId
      },
      UpdateExpression: `SET ${_map(keys, (key: string): string => `${key} = :${key}`).join(', ')}, subscribedAt = :subscribedAt, expiredDate = :expiredDate`,
      ExpressionAttributeValues: {
        ...Object.assign({}, ..._map(keys, (key: string) => ({ [`:${key}`]: _get(this.body, key) }))),
        ':subscribedAt': Date.now(),
        ':expiredDate': expiredDate.getTime()
      },
      ReturnValues: 'ALL_NEW'
    };

    const results = await this.dynamoDB.update(params).promise();

    return _get(results, 'Attributes', {});
  }

  private async recordTheNewSubscription(userId: string, receiptData: IReceiptData): Promise<void> {
    const biller: string = _get(this.body, 'biller', '');
    let receiptId: string = _get(receiptData, 'purchaseToken', '');

    if (biller.toLowerCase() === 'ios') {
      // handle IOS
      const validator: IAppleVerifyResponse | unknown = await verifyReceipt(_get(receiptData, 'receiptData', ''));
      receiptId = _get(validator, 'latest_receipt_info[0].original_transaction_id', '');
    }

    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.SUBSCRIPTION_TABLE_NAME as string,
      Item: {
        receiptId,
        userId,
        biller,
        status: 'SUBSCRIPTION_PURCHASED',
        createdBy: 'App',
        updatedBy: 'App',
        receiptData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    };

    console.log('Putting to DB', params);

    await this.dynamoDB.put(params).promise();
  }

  private async insertToDB(): Promise<APIGatewayProxyResultV2> {
    const userId: string = _get(this.pathParameters, 'userId', '');
    const currentItem = await this.getSubscriber(userId);

    if (_isEmpty(currentItem)) {
      const item = await this.putToDB(userId);
      // Put to subscription table
      const receipt: string = _get(this.body, 'receipt', '');

      if (_isEmpty(receipt) === false) {
        console.log('Receving this with Receipt', receipt);
        let receiptData: IReceiptData = {
          receiptData: receipt
        };

        try {
          // If this is Android receipt
          receiptData = JSON.parse(receipt);
        } catch (e: unknown) {
          console.log('This is an Apple Receipt', receiptData);
        }

        try {
          await this.recordTheNewSubscription(userId, receiptData);
        } catch (e: unknown) {
          console.log('Error when passing Data to subscription table', e);
        }
        
      }

      return success(item);
    }

    const updator = await this.updateItemDB(userId);
    return success(updator);
  }

  public beginSubscription(): APIGatewayProxyResultV2 | Promise<APIGatewayProxyResultV2> {
    const userId: string = _get(this.pathParameters, 'userId', '');
    
    if (_isEmpty(userId) === true || _isEmpty(this.body) === true) {
      return failure({ message: 'Invalid input' }, 400);
    }

    return this.insertToDB();
  }
}

export default SubscriberController;
