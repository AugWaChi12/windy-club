import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionInfo } from '../../models/types';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
      <h2 class="text-sm font-semibold text-[var(--text-secondary)] mb-4">📋 Recent Transactions</h2>
      
      @if (transactions.length === 0) {
        <p class="text-sm text-[var(--text-muted)] text-center py-8">No transactions found</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="text-[var(--text-muted)] border-b border-[var(--border)]">
                <th class="text-left py-2 pr-4">Hash</th>
                <th class="text-left py-2 pr-4">Type</th>
                <th class="text-left py-2 pr-4">From</th>
                <th class="text-left py-2 pr-4">To</th>
                <th class="text-right py-2 pr-4">Amount</th>
                <th class="text-right py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              @for (tx of transactions; track tx.txHash) {
                <tr class="border-b border-[var(--border)]/50 hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td class="py-3 pr-4 font-mono text-[var(--accent)]">{{ tx.txHash | slice:0:10 }}...</td>
                  <td class="py-3 pr-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize"
                      [ngClass]="{
                        'bg-blue-500/10 text-blue-400': tx.txType === 'transfer',
                        'bg-purple-500/10 text-purple-400': tx.txType === 'swap',
                        'bg-[var(--accent)]/10 text-[var(--accent)]': tx.txType === 'staking',
                        'bg-orange-500/10 text-orange-400': tx.txType === 'bridge'
                      }"
                    >
                      {{ tx.txType }}
                    </span>
                  </td>
                  <td class="py-3 pr-4 font-mono text-[var(--text-muted)]">{{ tx.fromAddress | slice:0:8 }}...</td>
                  <td class="py-3 pr-4 font-mono text-[var(--text-muted)]">{{ tx.toAddress | slice:0:8 }}...</td>
                  <td class="py-3 pr-4 text-right font-medium text-[var(--text-primary)]">{{ tx.amount | number:'1.4-4' }} {{ tx.tokenSymbol }}</td>
                  <td class="py-3 text-right text-[var(--text-muted)]">{{ tx.blockTimestamp | date:'short' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class TransactionListComponent {
  @Input() transactions: TransactionInfo[] = [];
}
