import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PnlInfo } from '../../models/types';

@Component({
  selector: 'app-pnl-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
      <h2 class="text-sm font-semibold text-[var(--text-secondary)] mb-4">📈 Profit & Loss</h2>
      
      @if (pnl) {
        <div class="space-y-4">
          <!-- Total PnL -->
          <div class="text-center py-4">
            <p class="text-xs text-[var(--text-muted)] mb-1">Total PnL</p>
            <p class="text-3xl font-bold" 
               [class]="pnl.totalPnl >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'">
              {{ pnl.totalPnl >= 0 ? '+' : '' }}{{ pnl.totalPnl | number:'1.2-2' }} USD
            </p>
            <p class="text-sm mt-1"
               [class]="pnl.pnlPercentage >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'">
              {{ pnl.pnlPercentage >= 0 ? '+' : '' }}{{ pnl.pnlPercentage | number:'1.2-2' }}%
            </p>
          </div>

          <!-- Breakdown -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-[var(--bg-secondary)] rounded-xl p-3">
              <p class="text-[10px] text-[var(--text-muted)]">Invested</p>
              <p class="text-sm font-semibold text-[var(--text-primary)]">\${{ pnl.totalInvested | number:'1.2-2' }}</p>
            </div>
            <div class="bg-[var(--bg-secondary)] rounded-xl p-3">
              <p class="text-[10px] text-[var(--text-muted)]">Current Value</p>
              <p class="text-sm font-semibold text-[var(--text-primary)]">\${{ pnl.currentValue | number:'1.2-2' }}</p>
            </div>
            <div class="bg-[var(--bg-secondary)] rounded-xl p-3">
              <p class="text-[10px] text-[var(--text-muted)]">Avg. Cost</p>
              <p class="text-sm font-semibold text-[var(--text-primary)]">{{ pnl.averageCost | number:'1.4-4' }} KUB</p>
            </div>
            <div class="bg-[var(--bg-secondary)] rounded-xl p-3">
              <p class="text-[10px] text-[var(--text-muted)]">Staking Rewards</p>
              <p class="text-sm font-semibold text-[var(--accent)]">{{ pnl.stakingRewards | number:'1.4-4' }} KUB</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PnlChartComponent {
  @Input() pnl: PnlInfo | null = null;
}
