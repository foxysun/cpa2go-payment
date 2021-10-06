import Axios, { AxiosResponse } from 'axios';
import IAppleVerifyResponse from '../types/iap/apple-response';

enum AppleServer {
  Sandbox = 'https://sandbox.itunes.apple.com/verifyReceipt',
  Production = 'https://buy.itunes.apple.com/verifyReceipt'
}

const APPLE_STATUS_CODE = {
  Success: {
    code: 0,
    message: 'Success!'
  },
  InValidRequestMethod: {
    code: 21000,
    message: 'The request to the App Store was not made using the HTTP POST request method.'
  },
  DataMalformedOrMissing: {
    code: 21002,
    message: 'The data in the receipt-data property was malformed or missing.'
  },
  CouldNotAuthenticated: {
    code: 21003,
    message: 'The receipt could not be authenticated.'
  },
  SecretDoesNotMatch: {
    code: 21004,
    message: 'The shared secret you provided does not match the shared secret on file for your account.'
  },
  ServerNotReady: {
    code: 21005,
    message: 'The receipt server is not currently available.'
  },
  SubscriptionHasExpired: {
    code: 21006,
    message: 'This receipt is valid but the subscription has expired. When this status code is returned to your server, the receipt data is also decoded and returned as part of the response. Only returned for iOS 6-style transaction receipts for auto-renewable subscriptions.'
  },
  ReceiptFromSandbox: {
    code: 21007,
    message: 'This receipt is from the test environment, but it was sent to the production environment for verification.'
  },
  ReceiptFromProduction: {
    code: 21008,
    message: 'This receipt is from the production environment, but it was sent to the test environment for verification.'
  },
  InternalDataAccessError: {
    code: 21009,
    message: 'Internal data access error. Try again later.'
  },
  UserAccountNotFound: {
    code: 21010,
    message: 'The user account cannot be found or has been deleted.'
  }
}

export const verifyReceipt = async (receiptData: string): Promise<IAppleVerifyResponse | unknown> => {
  const dataToApple = {
    'receipt-data': receiptData,
    'password': process.env.APPLE_SECRET,
    'exclude-old-transactions': true
  }

  try {
    let res: AxiosResponse<IAppleVerifyResponse> = await Axios.post(AppleServer.Production, dataToApple);

    if (res.data.status === APPLE_STATUS_CODE.ReceiptFromSandbox.code) {
      res = await Axios.post(AppleServer.Sandbox, dataToApple);
    }

    return res.data;
  } catch (err: unknown) {
    return err;
  }
};
