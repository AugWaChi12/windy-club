import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Alert } from '../models/types';

declare var SockJS: any;
declare var Stomp: any;

@Injectable({
  providedIn: 'root',
})
export class WebsocketService implements OnDestroy {
  private stompClient: any = null;
  private alertSubject = new Subject<Alert>();
  private blockSubject = new Subject<number>();
  private connected = false;

  get alerts$(): Observable<Alert> {
    return this.alertSubject.asObservable();
  }

  get blocks$(): Observable<number> {
    return this.blockSubject.asObservable();
  }

  connect(): void {
    if (this.connected) return;

    const socket = new SockJS(environment.wsUrl);
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = () => {}; // Suppress debug logs

    this.stompClient.connect({}, () => {
      this.connected = true;

      // Subscribe to alerts
      this.stompClient.subscribe('/topic/alerts', (message: any) => {
        const alert: Alert = JSON.parse(message.body);
        this.alertSubject.next(alert);
      });

      // Subscribe to block updates
      this.stompClient.subscribe('/topic/blocks', (message: any) => {
        const blockNumber = JSON.parse(message.body);
        this.blockSubject.next(blockNumber);
      });
    });
  }

  subscribeToWallet(address: string): Observable<any> {
    const walletSubject = new Subject<any>();

    if (this.stompClient && this.connected) {
      this.stompClient.subscribe(
        `/topic/wallet/${address}`,
        (message: any) => {
          walletSubject.next(JSON.parse(message.body));
        }
      );
    }

    return walletSubject.asObservable();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.connected = false;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
