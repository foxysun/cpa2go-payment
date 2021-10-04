import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from 'aws-lambda';
import SubscriptionController from '../controller/subscription-controller';

export const subscriptionHandler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
) => {
  const subscriptionController: SubscriptionController = new SubscriptionController(event);
  return subscriptionController.main();
};
