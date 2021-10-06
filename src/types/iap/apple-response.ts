export interface ILatestReceiptInfo {
  original_transaction_id: string;
}

export default interface IAppleVerifyResponse {
  environment: string;
  'is-retryable': boolean;
  latest_receipt: string;
  latest_receipt_info: ILatestReceiptInfo[];
  status: number;
}
