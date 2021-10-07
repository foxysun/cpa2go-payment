export default interface ISubscriberModel {
  userId: string;
  biller: string;
  receipt: string;
  expiredDate: number;
  questionNumber: number;
  subscribedAt: number;
}
