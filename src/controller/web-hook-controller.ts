import { AWSError, DynamoDB } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { get as _get } from 'lodash';
import { success } from '../utils/http-response';
import AbstractController from './abstract-controller';
import UserProxyController from './proxies/user-controller';

enum Platform {
  Apple = 'Apple',
  Google = 'Google'
}

class WebhookController extends AbstractController {
  private dynamoDB: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();
  private userController: UserProxyController = new UserProxyController();
  
  private getQuestionByProductId(productId: string): number {
    switch (productId) {
      case 'com.cpa2go.1month10questionssub':
        return 10;
      case 'com.cpa2go.1month5questionssub':
        return 5;
      case 'com.cpa2go.1month3questionssub':
        return 3;
      case 'com.cpa2go.1month1questionssub':
        return 1;
      default:
        return 0;
    }
  }

  private isValid(): boolean {
    try {
      if (this.method === 'POST') {
        let data;
  
        if (typeof this.event.body === 'string') {
          data = JSON.parse(this.event.body);
        } else {
          data = this.event.body;
        }
  
        if (data.password &&
          (data.password === process.env.GOOGLE_PUB_SUB_SECRET || data.password === process.env.APPLE_SECRET)
        ) {
          return data;
        }
      }
  
      return false;
    }
    catch (e: unknown) {
      console.log('checking valid data got error', e);
      return false;
    }
  }

  private async getUserIdByReceiptId(receiptId: string): Promise<string> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: process.env.SUBSCRIPTION_TABLE_NAME as string,
      Key: {
        receiptId
      }
    };
    const result: PromiseResult<DynamoDB.DocumentClient.GetItemOutput, AWSError> = await this.dynamoDB.get(params).promise();
    
    return _get(result, 'Item.userId', '');
  }

  private checkPlatform(data: any): Platform {
    const { password } = data;

    return password === process.env.APPLE_SECRET ? Platform.Apple : Platform.Google;
  }

  private async processAppleEvent(data: any): Promise<void> {
    if (data.notification_type === 'DID_RENEW') {
      const receipt: any = _get(data, 'unified_receipt.latest_receipt_info[0]');
      const { product_id, original_transaction_id }: any = receipt;
      const questionNumber: number = this.getQuestionByProductId(product_id);
      const userId: string = await this.getUserIdByReceiptId(original_transaction_id);

      await this.userController.increaseQuestion(userId, questionNumber);
      console.log('Succesfully increased ', questionNumber, 'userId: ', userId);
    }
    console.log('Got apple event', data);
  }

  private async processGoogleEvent(data: any): Promise<void> {
    const type: number = _get(data, 'billingData.subscriptionNotification.notificationType', 0);

    if (type === 2) { // Renew
      const packageName: string = _get(data, 'billingData.subscriptionNotification.subscriptionId', '');
      const receiptId: string = _get(data, 'billingData.subscriptionNotification.purchaseToken', '');
      const userId: string = await this.getUserIdByReceiptId(receiptId);
      const questionNumber: number = this.getQuestionByProductId(packageName);

      await this.userController.increaseQuestion(userId, questionNumber);
      console.log('Succesfully increased Google', questionNumber, 'userId: ', userId);
    }
  }

  public async listen() {
    console.log('Got Event', this.event);
    const data: any = this.isValid();

    console.log('VAlid data?', data);

    if (data !== false) {
      if (this.checkPlatform(data) === Platform.Apple) {
        await this.processAppleEvent(data);
      } else {
        await this.processGoogleEvent(data);
      }

      return success({ message: 'All Good' });
    }

    return success({ message: 'Invalid Data' });
  }
}

export default WebhookController;
