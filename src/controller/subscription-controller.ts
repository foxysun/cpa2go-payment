import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { success } from '../utils/http-response';
import AbstractController from './abstract-controller';

class SubscriptionController extends AbstractController {
  public main(): APIGatewayProxyResultV2 {
    return success({ db: process.env.SUBSCRIPTION_TABLE_NAME });
  }
}

export default SubscriptionController;
