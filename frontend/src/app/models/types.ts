export interface WalletInfo {
  address: string;
  label: string | null;
  behaviorType: string;
  balanceKub: number;
  balanceUsd: number;
  totalTransactions: number;
  firstSeenAt: string;
}

export interface TransactionInfo {
  txHash: string;
  txType: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  tokenSymbol: string;
  gasUsed: number;
  status: string;
  blockTimestamp: string;
}

export interface PnlInfo {
  walletAddress: string;
  totalInvested: number;
  currentValue: number;
  unrealizedPnl: number;
  realizedPnl: number;
  totalPnl: number;
  pnlPercentage: number;
  averageCost: number;
  stakingRewards: number;
  tokenBreakdown: TokenPnl[];
}

export interface TokenPnl {
  symbol: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
}

export interface AnalyticsInfo {
  walletAddress: string;
  behaviorProfile: string;
  transactionTypeBreakdown: Record<string, number>;
  spending: SpendingAnalysis;
  bridge: BridgeAnalysis;
  activityTimeline: ActivityPeriod[];
}

export interface SpendingAnalysis {
  totalSpent: number;
  gasSpent: number;
  stakingSpent: number;
  swapVolume: number;
  bridgeVolume: number;
}

export interface BridgeAnalysis {
  totalBridgedIn: number;
  totalBridgedOut: number;
  netFlow: number;
  bridgeCount: number;
}

export interface ActivityPeriod {
  period: string;
  transactionCount: number;
  volume: number;
}

export interface Alert {
  id: number;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  walletAddress: string;
  txHash: string;
  amount: number;
  read: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
