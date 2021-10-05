import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from 'aws-lambda';
import SubscriberController from '../controller/subscriber-controller';

export const beginSubscription: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
) => {
  const subscriberController: SubscriberController = new SubscriberController(event);
  return subscriberController.beginSubscription();
};
