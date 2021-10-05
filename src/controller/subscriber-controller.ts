import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AWSError, DynamoDB } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { get as _get, isEmpty as _isEmpty, keys as _keys, map as _map } from 'lodash';
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

  private async insertToDB(): Promise<APIGatewayProxyResultV2> {
    const userId: string = _get(this.pathParameters, 'userId', '');
    const currentItem = await this.getSubscriber(userId);

    if (_isEmpty(currentItem)) {
      const item = await this.putToDB(userId);
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
