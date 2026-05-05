import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alert } from '../../models/types';

@Component({
  selector: 'app-whale-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (alerts.length === 0) {
      <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 text-center">
        <p class="text-sm text-[var(--text-muted)]">No whale alerts yet. Monitoring large transactions...</p>
      </div>
    } @else {
      <div class="space-y-2">
        @for (alert of alerts; track alert.id) {
          <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-4 hover:border-[var(--warning)]/50 transition-colors">
            <div class="w-10 h-10 rounded-full bg-[var(--warning)]/10 flex items-center justify-center shrink-0">
              <span class="text-lg">🐋</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[var(--text-primary)] truncate">{{ alert.title }}</p>
              <p class="text-xs text-[var(--text-muted)] truncate">{{ alert.message }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold text-[var(--warning)]">{{ alert.amount | number:'1.0-0' }} KUB</p>
              <p class="text-[10px] text-[var(--text-muted)]">{{ alert.createdAt | date:'shortTime' }}</p>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class WhaleAlertComponent {
  @Input() alerts: Alert[] = [];
}
