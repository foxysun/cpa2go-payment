import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyEventPathParameters
} from 'aws-lambda';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { get as _get } from 'lodash';
import { success } from '../utils/http-response';

export type EventPraser = {
  method: HttpMethod;
  queryStringParameters: APIGatewayProxyEventQueryStringParameters;
  body: any;
  pathParameters: APIGatewayProxyEventPathParameters;
}

abstract class AbstractController {
  protected event: APIGatewayProxyEventV2;
  protected method: HttpMethod;
  protected queryStringParameters: APIGatewayProxyEventQueryStringParameters;
  protected body: any;
  protected pathParameters: APIGatewayProxyEventPathParameters;

  public constructor(event: APIGatewayProxyEventV2) {
    this.event = event;
    const eventParserRes: EventPraser = this.eventParser();
    this.method = eventParserRes.method;
    this.queryStringParameters = eventParserRes.queryStringParameters;
    this.body = eventParserRes.body;
    this.pathParameters = eventParserRes.pathParameters;
  }

  private eventParser(): EventPraser {
    return (
      {
        method: _get(this.event, 'httpMethod', _get(this.event, 'requestContext.http.method', '')),
        queryStringParameters: _get(this.event, 'queryStringParameters', {}),
        body: JSON.parse(_get(this.event, 'body', '{}')),
        pathParameters: _get(this.event, 'pathParameters', {})
      }
    );
  }

  public main(): APIGatewayProxyResultV2 {
    return success({ message: 'All Good 1', event: this.event });
  }
}

export default AbstractController;
