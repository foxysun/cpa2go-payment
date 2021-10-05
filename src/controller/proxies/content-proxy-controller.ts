import { AxiosPromise } from 'axios';
import AbstractProxyController from './abstract-proxy-controller';

class ContentProxyController<ResponseType, RequestType> extends AbstractProxyController {
  public list(): AxiosPromise<ResponseType[]> {
    return this.http.get('');
  }

  public get(key: string, value: string): AxiosPromise<ResponseType> {
    return this.http.get(`?${key}=${value}`);
  }
}

export default ContentProxyController;
