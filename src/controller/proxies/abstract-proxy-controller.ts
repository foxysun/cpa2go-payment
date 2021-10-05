import Axios, { AxiosInstance } from 'axios';

abstract class AbstractProxyController {
  protected baseUrl: string;
  protected path: string;
  protected readonly http: AxiosInstance;

  constructor(path: string) {
    this.path = path;
    this.baseUrl = process.env.PHP_API_SERVER || 'https://cpa2go.com';
    this.http = Axios.create({
      baseURL: `${this.baseUrl}/${this.path}`,
      headers: {
        apikey: process.env.API_KEY_MIDDLE as string
      }
    });
  }
}

export default AbstractProxyController;
