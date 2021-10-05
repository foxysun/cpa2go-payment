import IUser from '../../types/proxy/user';
import ContentProxyController from './content-proxy-controller';

class UserProxyController extends ContentProxyController<IUser, any> {
  constructor() {
    super('api/admin-user-api');
  }
}

export default UserProxyController;
