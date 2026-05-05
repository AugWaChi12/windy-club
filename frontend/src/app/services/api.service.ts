import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  WalletInfo,
  TransactionInfo,
  PnlInfo,
  AnalyticsInfo,
  PageResponse,
} from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Wallet
  getWallet(address: string): Observable<WalletInfo> {
    return this.http.get<WalletInfo>(`${this.baseUrl}/wallet/${address}`);
  }

  // Transactions
  getTransactions(
    address: string,
    page = 0,
    size = 20
  ): Observable<PageResponse<TransactionInfo>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<TransactionInfo>>(
      `${this.baseUrl}/tx/${address}`,
      { params }
    );
  }

  // PnL
  getPnl(address: string): Observable<PnlInfo> {
    return this.http.get<PnlInfo>(`${this.baseUrl}/pnl/${address}`);
  }

  // Analytics
  getAnalytics(address: string): Observable<AnalyticsInfo> {
    return this.http.get<AnalyticsInfo>(
      `${this.baseUrl}/analytics/${address}`
    );
  }
}
