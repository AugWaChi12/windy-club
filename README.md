# Windy Chain Intelligence

Blockchain analytics platform for KUB Chain (EVM-compatible). Transforms raw transaction data into meaningful financial insights.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│   Angular   │────▶│  Spring Boot │────▶│ PostgreSQL│
│  Frontend   │◀────│   Backend    │────▶│   Redis   │
└─────────────┘     └──────┬───────┘     └───────────┘
                           │
                    ┌──────▼───────┐
                    │  KUB Chain   │
                    │  (EVM RPC)   │
                    └──────────────┘
```

## Tech Stack

- **Backend:** Java 21, Spring Boot 3.3, JPA, WebSocket
- **Frontend:** Angular 20, TailwindCSS, STOMP WebSocket
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Blockchain:** Web3j → KUB Chain RPC

## Features

- 🔍 Wallet Analytics (balance, history, behavior profiling)
- 📊 Transaction Parser (classify: transfer, swap, stake, bridge)
- 📈 PnL Engine (profit/loss, average cost, staking rewards)
- 🐋 Whale Tracking (large transaction detection + real-time alerts)
- 🪙 Token Scanner (new contracts, volume spikes)
- 🌉 Bridge Analysis (net flow in/out)
- 🧠 Behavior Profiling (holder, trader, staker classification)
- ⚡ Real-time updates via WebSocket

## Quick Start

### Docker (recommended)

```bash
docker compose up -d
```

- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Manual Development

#### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Requires: Java 21, PostgreSQL, Redis running locally.

#### Frontend

```bash
cd frontend
npm install
ng serve
```

Open http://localhost:4200

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/{address}` | Wallet info + balance |
| GET | `/api/tx/{address}?page=0&size=20` | Transaction history |
| GET | `/api/pnl/{address}` | Profit & Loss calculation |
| GET | `/api/analytics/{address}` | Full analytics + behavior |

### WebSocket

- `/ws` — STOMP endpoint (SockJS)
- `/topic/alerts` — Whale & token alerts
- `/topic/blocks` — New block notifications
- `/topic/wallet/{address}` — Wallet-specific updates

## Project Structure

```
windy-club/
├── backend/
│   ├── src/main/java/com/windychain/intelligence/
│   │   ├── config/          # App configuration
│   │   ├── integration/     # External service clients
│   │   ├── event/           # Block processor, event handlers
│   │   ├── websocket/       # WebSocket handlers
│   │   └── module/
│   │       ├── wallet/      # Wallet domain
│   │       ├── transaction/ # Transaction domain
│   │       ├── pnl/         # PnL calculations
│   │       ├── analytics/   # Analytics engine
│   │       ├── alert/       # Alert system
│   │       ├── staking/     # Staking positions
│   │       └── token/       # Token scanner
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/    # Flyway migrations
├── frontend/
│   └── src/app/
│       ├── pages/           # Dashboard, Wallet, Analytics
│       ├── components/      # Reusable UI components
│       ├── services/        # API & WebSocket services
│       └── models/          # TypeScript interfaces
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── nginx.conf
```

## License

Private — All rights reserved.
