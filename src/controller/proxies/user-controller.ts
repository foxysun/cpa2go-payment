import { AxiosPromise, AxiosResponse } from 'axios';
import IUser from '../../types/proxy/user';
import ContentProxyController from './content-proxy-controller';

class UserProxyController extends ContentProxyController<IUser, any> {
  constructor() {
    super('api/admin-user-api');
  }

  public getUserById(userId: string): AxiosPromise<IUser> {
    return this.get('userId', userId);
  }

  public async increaseQuestion(userId: string, questionToIncrease: number): Promise<AxiosPromise<IUser>> {
    const { data }: AxiosResponse<IUser> = await this.getUserById(userId);
    const { no_of_question_count }: IUser = data;

    return this.http.post('', {
      userId,
      questionNumber: questionToIncrease + parseInt(no_of_question_count, 10)
    });
  }
}

export default UserProxyController;
