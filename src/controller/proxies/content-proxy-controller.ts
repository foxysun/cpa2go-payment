import { AxiosPromise } from 'axios';
import AbstractProxyController from './abstract-proxy-controller';

class ContentProxyController<ResponseType, RequestType> extends AbstractProxyController {
  public list(): AxiosPromise<ResponseType[]> {
    return this.http.get(`/${this.path}`);
  }
}

export default ContentProxyController;
