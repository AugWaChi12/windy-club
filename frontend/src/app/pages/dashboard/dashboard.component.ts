import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../services/websocket.service';
import { WalletOverviewComponent } from '../../components/wallet-overview/wallet-overview.component';
import { WhaleAlertComponent } from '../../components/whale-alert/whale-alert.component';
import { Alert } from '../../models/types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, WalletOverviewComponent, WhaleAlertComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  searchAddress = '';
  latestBlock = 0;
  alerts: Alert[] = [];
  private subscriptions = new Subscription();

  constructor(private wsService: WebsocketService) {}

  ngOnInit(): void {
    this.wsService.connect();

    this.subscriptions.add(
      this.wsService.blocks$.subscribe((block) => {
        this.latestBlock = block;
      })
    );

    this.subscriptions.add(
      this.wsService.alerts$.subscribe((alert) => {
        this.alerts.unshift(alert);
        if (this.alerts.length > 10) {
          this.alerts = this.alerts.slice(0, 10);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
