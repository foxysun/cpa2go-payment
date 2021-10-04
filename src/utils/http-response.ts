/**
 * Currently we only handle json, and the rest will reponse as text/plain
 * TODO: should handle more content types
 */
const DEFAULT_RESPONSE_TYPE = 'application/json';

/**
 * Building http response object
 * @param {number} statusCode
 * @param {object|string} body
 * @param {string} contentType
 * @returns Return http response object
 */
 const _buildResponse = (statusCode: number, body: any, contentType: string) => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Content-Type": contentType,
    },
    body: contentType === DEFAULT_RESPONSE_TYPE ? JSON.stringify(body) : body
  };
}

/**
 * Return success http response with status 200
 * @param {object|string} body
 * @param {string} contentType (optional) - application/json as default
 * @returns Return http success response with status 200
 */
export const success = (body: any, contentType: string = DEFAULT_RESPONSE_TYPE) => {
  return _buildResponse(200, body, contentType);
};

/**
 * Return failure http response with status code parameter
 * @param {object|string} body
 * @param {string} contentType (optional) - application/json as default
 * @returns Return failure http response with status 200
 */
export const failure = (body: any, statusCode = 500, contentType: string = DEFAULT_RESPONSE_TYPE) => {
  return _buildResponse(statusCode, body, contentType);
};

export const redirect = (url: string, statusCode = 301) => {
  return {
    statusCode,
    headers: {
      Location: url
    }
  }
}
