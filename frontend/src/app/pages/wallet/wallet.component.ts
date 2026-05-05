import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { WalletInfo, TransactionInfo, PnlInfo, PageResponse } from '../../models/types';
import { WalletOverviewComponent } from '../../components/wallet-overview/wallet-overview.component';
import { TransactionListComponent } from '../../components/transaction-list/transaction-list.component';
import { PnlChartComponent } from '../../components/pnl-chart/pnl-chart.component';
import { StakingPanelComponent } from '../../components/staking-panel/staking-panel.component';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    WalletOverviewComponent,
    TransactionListComponent,
    PnlChartComponent,
    StakingPanelComponent,
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',
})
export class WalletComponent implements OnInit {
  address: string = '';
  wallet: WalletInfo | null = null;
  transactions: TransactionInfo[] = [];
  pnl: PnlInfo | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['address']) {
        this.address = params['address'];
        this.loadWalletData();
      }
    });
  }

  loadWalletData(): void {
    if (!this.address) return;
    this.loading = true;
    this.error = null;

    this.apiService.getWallet(this.address).subscribe({
      next: (data) => {
        this.wallet = data;
      },
      error: (err) => {
        this.error = 'Failed to load wallet data';
        this.loading = false;
      },
    });

    this.apiService.getTransactions(this.address).subscribe({
      next: (data: PageResponse<TransactionInfo>) => {
        this.transactions = data.content;
      },
      error: () => {},
    });

    this.apiService.getPnl(this.address).subscribe({
      next: (data) => {
        this.pnl = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
