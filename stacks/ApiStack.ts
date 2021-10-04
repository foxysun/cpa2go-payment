import * as sst from '@serverless-stack/resources';
import { CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2';

type DBProps = {
  subscription: sst.Table;
}

export type ApiStackProps = sst.StackProps & {
  db: DBProps;
}

export default class ApiStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: ApiStackProps) {
    super(scope, id, props);
    
    const { db }: ApiStackProps = props;
    const { subscription }: DBProps = db;
    // Create a HTTP API
    const api = new sst.Api(this, 'MainApi', {
      defaultFunctionProps: {
        environment: {
          SUBSCRIPTION_TABLE_NAME: subscription.tableName,
        },
      },
      cors: {
        allowMethods: [CorsHttpMethod.ANY],
      },
      routes: {
        'ANY /rest/subscription': 'src/handler.subscriptionHandler',
        'ANY /rest/subscription/{id}': 'src/handler.subscriptionHandler',
      },
    });

    // Add DB permission
    api.attachPermissions([db.subscription]);

    // Show the endpoint in the output
    this.addOutputs({
      'ApiEndpoint': api.url,
    });
  }
}
