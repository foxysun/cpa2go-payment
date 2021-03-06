import * as sst from '@serverless-stack/resources';
import { CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2';

type DBProps = {
  subscription: sst.Table;
  subscriber: sst.Table;
}

export type ApiStackProps = sst.StackProps & {
  db: DBProps;
}

export default class ApiStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: ApiStackProps) {
    super(scope, id, props);
    
    const { db }: ApiStackProps = props;
    const { subscription, subscriber }: DBProps = db;
    // Create a HTTP API
    const api = new sst.Api(this, 'MainApi', {
      defaultFunctionProps: {
        environment: {
          SUBSCRIPTION_TABLE_NAME: subscription.tableName,
          SUBSCRIBER_TABLE_NAME: subscriber.tableName,
          API_KEY_MIDDLE: process.env.API_KEY_MIDDLE,
          PHP_API_SERVER: process.env.PHP_API_SERVER,
          APPLE_SECRET: process.env.APPLE_SECRET,
          GOOGLE_PUB_SUB_SECRET: process.env.GOOGLE_PUB_SUB_SECRET
        },
      },
      cors: {
        allowMethods: [CorsHttpMethod.ANY],
      },
      routes: {
        'ANY /rest/subscription': 'src/handler.subscriptionHandler',
        'ANY /rest/subscription/{id}': 'src/handler.subscriptionHandler',
        'POST /rest/subscriber/begin-subscription/{userId}': 'src/handler.beginSubscription',
        'GET /rest/subscriber/check-subscription': 'src/handler.checkSubscription',
        'POST /webhook/iap': 'src/handler.webhookHandler'
      },
    });

    // Add DB permission
    api.attachPermissions([db.subscription, db.subscriber]);

    // Show the endpoint in the output
    this.addOutputs({
      'ApiEndpoint': api.url,
    });
  }
}
