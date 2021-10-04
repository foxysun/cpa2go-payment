import * as sst from '@serverless-stack/resources';
import ApiStack from './ApiStack';
import SubscriptionTableStack from './dynamodb/subscription-table';

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: 'nodejs12.x'
  });

  const subscriptionDB: SubscriptionTableStack = new SubscriptionTableStack(app, 'dynamodb-table-subscription');

  new ApiStack(app, 'main-api-stack', {
    db: {
      subscription: subscriptionDB.table
    }
  });

  // Add more stacks
}
