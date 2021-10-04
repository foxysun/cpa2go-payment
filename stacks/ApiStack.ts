import * as sst from '@serverless-stack/resources';

export default class ApiStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    // Create a HTTP API
    const api = new sst.Api(this, 'MainApi', {
      routes: {
        'ANY /rest/subscription': 'src/handler.subscriptionHandler',
        'ANY /rest/subscription/{id}': 'src/handler.subscriptionHandler',
      },
    });

    // Show the endpoint in the output
    this.addOutputs({
      'ApiEndpoint': api.url,
    });
  }
}
