import * as sst from '@serverless-stack/resources';

export default class SubscriptionTableStack extends sst.Stack {
  // Public reference to the table
  public table: sst.Table;

  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    // Create the DynamoDB table
    this.table = new sst.Table(this, 'subscription', {
      fields: {
        receiptId: sst.TableFieldType.STRING,
        userId: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: 'receiptId' },
      secondaryIndexes: { userIdIndex: { partitionKey: 'userId' }}
    });
  }
}
