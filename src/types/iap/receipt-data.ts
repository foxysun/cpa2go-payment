export interface IReceiptDataAndroid {
  purchaseToken: string;
  orderId: string;
  packageName: string;
  productId: string;
  purchaseTime: number;
  purchaseState: number;
  autoRenewing: boolean;
  acknowledged: boolean;
}

export interface IReceiptDataApple {
  receiptData: string;
}

type IReceiptData = IReceiptDataAndroid | IReceiptDataApple;

export default IReceiptData;
