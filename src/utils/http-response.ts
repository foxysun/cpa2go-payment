import { APIGatewayProxyResultV2 } from "aws-lambda";

const DEFAULT_RESPONSE_TYPE = 'application/json';

type ResponseBody = {
  [key: string]: any;
}

const _buildResponse = (statusCode: number, body: ResponseBody, contentType: string): APIGatewayProxyResultV2 => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Content-Type": contentType,
    },
    body: (contentType === DEFAULT_RESPONSE_TYPE ? JSON.stringify(body) : body) as string | undefined
  };
}

export const success = (body: ResponseBody, contentType: string = DEFAULT_RESPONSE_TYPE): APIGatewayProxyResultV2 => {
  return _buildResponse(200, body, contentType);
};

export const failure = (body: ResponseBody, statusCode = 500, contentType: string = DEFAULT_RESPONSE_TYPE): APIGatewayProxyResultV2 => {
  return _buildResponse(statusCode, body, contentType);
};
