import { IHubConnectionOptions } from '@aspnet/signalr-client/dist/src/IHubConnectionOptions';
import { Observable, Subject } from 'rxjs';

export interface IAngularSignalrService {
  start(): Promise<any>;
  stop(): void;
  on<T>(event: string): Observable<T>;
  send(methodName: string, data?: any[]): Promise<any>;
  invoke(methodName: string, data?: any[]): Promise<any>;
}

export interface IAngularSignalrConfig {
  hubUrl: string;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  connectionOptions?: IHubConnectionOptions;
}

export interface IWsMessage<T> {
  event: string;
  data: T;
}

export interface IListeners {
  [eventName: string]: Subject<any>;
}