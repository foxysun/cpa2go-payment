import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from 'aws-lambda';
import UserProxyController from '../controller/proxies/user-controller';
import { success } from '../utils/http-response';

export const userProxyHandler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
) => {
  const userController: UserProxyController = new UserProxyController();
  const data = await userController.list();

  return success(data.data);
};
