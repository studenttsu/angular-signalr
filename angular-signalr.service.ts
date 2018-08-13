import { Injectable, Inject } from '@angular/core';
import { HubConnection } from '@aspnet/signalr-client';
import { Observable, Subject, Subscription } from 'rxjs';
import { interval } from 'rxjs/observable/interval';
import { takeWhile, filter, map } from 'rxjs/operators';

import { config } from './angular-signalr.config';

import {
  IAngularSignalrService,
  IAngularSignalrConfig,
  IListeners,
  IWsMessage
} from './angular-signalr.interface';

@Injectable()
export class AngularSignalrService implements IAngularSignalrService {

  private _connection: HubConnection;
  private _reconnection$: Observable<number>;
  private _statusSubscription: Subscription;

  private _listeners: IListeners;

  private _reconnectInterval: number;
  private _reconnectAttempts: number;

  public status: Subject<boolean>;

  constructor(
    @Inject(config) private wsConfig: IAngularSignalrConfig
  ) {
    this.status = new Subject<boolean>();

    this._listeners = {};

    this._reconnectInterval = wsConfig.reconnectInterval || 30000;
    this._reconnectAttempts = wsConfig.reconnectAttempts || 10;

    this._statusSubscription = this.status
      .subscribe((isConnected: boolean) => {
        if (!isConnected && !this._reconnection$) {
          this._reconnect();
        }
      });

    this._connect();
  }

  private async _connect(): Promise<any> {
    this._connection = new HubConnection(
      this.wsConfig.hubUrl,
      this.wsConfig.connectionOptions || {}
    );

    try {
      await this._connection.start();
      this.status.next(true);

      this._connection.onclose(() => {
        this.status.next(false);

        console.log(`[${Date()}] signalR connection closed`);
      });

      console.log(`[${Date()}] signalR connected`);
    } catch (error) {
      this._reconnect();
    }
  }

  private _reconnect(): void {
    if (!this._reconnection$) {
      this._reconnection$ = interval(this._reconnectInterval)
        .pipe(
          takeWhile((v, index) => index < this._reconnectAttempts)
        );

      this._reconnection$.subscribe(() => this._connect(), null, () => {
        this._reconnection$ = null;
        console.log(`[${Date()}] not connection to signalR`);
      });
    }
  }

  /**
   * Starts the connection.
   */
  public start(): Promise<any> {
    return this._connect();
  }

  /**
   * Stops the connection.
   */
  public stop(): void {
    if (this._connection) {
      this._connection.stop();
    }
  }

  public on<T>(eventName: string): Observable<T> {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = new Subject<T>();

      this._connection.on(eventName, (data: T) =>
        this._listeners[eventName].next({ event, data })
      );
    }

    return this._listeners[eventName]
      .pipe(
        filter((message: IWsMessage<T>) => message.event === eventName),
        map((message: IWsMessage<T>) => message.data)
      );
  }

  public async send(methodName: string, data?: any[]): Promise<any> {
    if (this._connection) {
      return this._connection.send(methodName, data);
    }
  }

  public async invoke(methodName: string, data?: any[]): Promise<any> {
    if (this._connection) {
      return this._connection.invoke(methodName, data);
    }
  }

}
