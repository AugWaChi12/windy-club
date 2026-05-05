import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-token-scanner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
      <h2 class="text-sm font-semibold text-[var(--text-secondary)] mb-4">🔍 Token Scanner</h2>
      
      <div class="space-y-3">
        <div class="bg-[var(--bg-secondary)] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-[var(--text-primary)]">New Contract Detection</p>
            <p class="text-xs text-[var(--text-muted)]">Monitoring for new token deployments on KUB Chain</p>
          </div>
          <span class="text-xs text-[var(--success)] bg-[var(--success)]/10 px-2.5 py-1 rounded-full font-medium">Active</span>
        </div>
        
        <div class="bg-[var(--bg-secondary)] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-[var(--text-primary)]">Volume Spike Detection</p>
            <p class="text-xs text-[var(--text-muted)]">Alert when token volume increases >200%</p>
          </div>
          <span class="text-xs text-[var(--success)] bg-[var(--success)]/10 px-2.5 py-1 rounded-full font-medium">Active</span>
        </div>

        <div class="bg-[var(--bg-secondary)] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-[var(--text-primary)]">Liquidity Pool Monitor</p>
            <p class="text-xs text-[var(--text-muted)]">Track new LP creation and removals</p>
          </div>
          <span class="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] px-2.5 py-1 rounded-full font-medium">Coming Soon</span>
        </div>
      </div>
    </div>
  `,
})
export class TokenScannerComponent {}
