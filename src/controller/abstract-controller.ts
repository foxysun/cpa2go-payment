import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { success } from '../utils/http-response';

abstract class AbstractController {
  protected event: APIGatewayProxyEventV2;

  public constructor(event: APIGatewayProxyEventV2) {
    this.event = event;
  }

  public main(): any {
    return success({ message: 'All Good 1', event: this.event });
  }
}

export default AbstractController;
