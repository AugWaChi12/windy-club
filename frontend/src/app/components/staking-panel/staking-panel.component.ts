import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-staking-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
      <h2 class="text-sm font-semibold text-[var(--text-secondary)] mb-4">🥩 Staking Positions</h2>
      
      <div class="space-y-3">
        <div class="bg-[var(--bg-secondary)] rounded-xl p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-[var(--text-muted)]">Total Staked</span>
            <span class="text-sm font-bold text-[var(--text-primary)]">0 KUB</span>
          </div>
          <div class="w-full bg-[var(--border)] rounded-full h-1.5">
            <div class="bg-[var(--accent)] h-1.5 rounded-full" style="width: 0%"></div>
          </div>
        </div>
        <div class="bg-[var(--bg-secondary)] rounded-xl p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-[var(--text-muted)]">Rewards Earned</span>
            <span class="text-sm font-bold text-[var(--accent)]">0 KUB</span>
          </div>
        </div>
        <p class="text-xs text-[var(--text-muted)] text-center py-2">
          Connect wallet to view staking positions
        </p>
      </div>
    </div>
  `,
})
export class StakingPanelComponent {
  @Input() address: string = '';
}
