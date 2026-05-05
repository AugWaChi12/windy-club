import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletInfo } from '../../models/types';

@Component({
  selector: 'app-wallet-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h2 class="text-sm font-semibold text-[var(--text-secondary)] mb-1">Wallet Overview</h2>
          <p class="text-xs text-[var(--text-muted)] font-mono">{{ wallet?.address }}</p>
        </div>
        <span
          class="text-[10px] font-bold px-2.5 py-1 rounded-full capitalize"
          [ngClass]="{
            'bg-[var(--accent)]/10 text-[var(--accent)]': wallet?.behaviorType === 'trader',
            'bg-[var(--warning)]/10 text-[var(--warning)]': wallet?.behaviorType === 'staker',
            'bg-blue-500/10 text-blue-400': wallet?.behaviorType === 'holder',
            'bg-[var(--text-muted)]/10 text-[var(--text-muted)]': wallet?.behaviorType === 'unknown'
          }"
        >
          {{ wallet?.behaviorType }}
        </span>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p class="text-xs text-[var(--text-muted)]">Balance (KUB)</p>
          <p class="text-lg font-bold text-[var(--text-primary)]">{{ wallet?.balanceKub | number:'1.4-4' }}</p>
        </div>
        <div>
          <p class="text-xs text-[var(--text-muted)]">Value (USD)</p>
          <p class="text-lg font-bold text-[var(--accent)]">\${{ wallet?.balanceUsd | number:'1.2-2' }}</p>
        </div>
        <div>
          <p class="text-xs text-[var(--text-muted)]">Transactions</p>
          <p class="text-lg font-bold text-[var(--text-primary)]">{{ wallet?.totalTransactions | number }}</p>
        </div>
        <div>
          <p class="text-xs text-[var(--text-muted)]">First Seen</p>
          <p class="text-sm font-medium text-[var(--text-primary)]">{{ wallet?.firstSeenAt | date:'mediumDate' }}</p>
        </div>
      </div>
    </div>
  `,
})
export class WalletOverviewComponent {
  @Input() wallet: WalletInfo | null = null;
}
