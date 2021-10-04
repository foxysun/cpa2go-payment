import * as sst from '@serverless-stack/resources';
import ApiStack from './ApiStack';

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: 'nodejs12.x'
  });

  new ApiStack(app, 'main-api-stack');

  // Add more stacks
}
