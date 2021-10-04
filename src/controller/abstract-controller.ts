import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { success } from '../utils/http-response';

abstract class AbstractController {
  protected event: APIGatewayProxyEventV2;

  public constructor(event: APIGatewayProxyEventV2) {
    this.event = event;
  }

  public main(): APIGatewayProxyResultV2 {
    return success({ message: 'All Good 1', event: this.event });
  }
}

export default AbstractController;
