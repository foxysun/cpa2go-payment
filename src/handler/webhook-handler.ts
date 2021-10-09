import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from 'aws-lambda';
import WebhookController from '../controller/web-hook-controller';

export const webhookHandler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
) => {
  const webhookController: WebhookController = new WebhookController(event);

  return webhookController.listen();
};
