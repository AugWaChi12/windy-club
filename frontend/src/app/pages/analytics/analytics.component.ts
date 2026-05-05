import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AnalyticsInfo } from '../../models/types';
import { TokenScannerComponent } from '../../components/token-scanner/token-scanner.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TokenScannerComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent implements OnInit {
  address = '';
  analytics: AnalyticsInfo | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['address']) {
        this.address = params['address'];
        this.loadAnalytics();
      }
    });
  }

  loadAnalytics(): void {
    if (!this.address) return;
    this.loading = true;

    this.apiService.getAnalytics(this.address).subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getTypeEntries(): { key: string; value: number }[] {
    if (!this.analytics?.transactionTypeBreakdown) return [];
    return Object.entries(this.analytics.transactionTypeBreakdown).map(
      ([key, value]) => ({ key, value })
    );
  }
}
