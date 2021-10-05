import * as sst from '@serverless-stack/resources';
import ApiStack from './ApiStack';
import SubscriberTableStack from './dynamodb/subscriber-table';
import SubscriptionTableStack from './dynamodb/subscription-table';

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: 'nodejs12.x'
  });

  const subscriptionDB: SubscriptionTableStack = new SubscriptionTableStack(app, 'dynamodb-table-subscription');
  const subscriberDB: SubscriberTableStack = new SubscriberTableStack(app, 'dynamodb-table-subscriber')

  new ApiStack(app, 'main-api-stack', {
    db: {
      subscription: subscriptionDB.table,
      subscriber: subscriberDB.table
    }
  });

  // Add more stacks
}
