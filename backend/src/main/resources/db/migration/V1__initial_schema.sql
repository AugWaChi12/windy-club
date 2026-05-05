-- V1: Initial schema for Windy Chain Intelligence

CREATE TABLE wallet (
    id              BIGSERIAL PRIMARY KEY,
    address         VARCHAR(42) NOT NULL UNIQUE,
    label           VARCHAR(100),
    behavior_type   VARCHAR(20) DEFAULT 'unknown',
    first_seen_at   TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallet_address ON wallet(address);

CREATE TABLE transaction (
    id              BIGSERIAL PRIMARY KEY,
    wallet_address  VARCHAR(42) NOT NULL,
    tx_hash         VARCHAR(66) NOT NULL UNIQUE,
    block_number    BIGINT NOT NULL,
    tx_type         VARCHAR(20) NOT NULL DEFAULT 'transfer',
    from_address    VARCHAR(42) NOT NULL,
    to_address      VARCHAR(42),
    amount          NUMERIC(38, 18) NOT NULL DEFAULT 0,
    token_address   VARCHAR(42),
    token_symbol    VARCHAR(20) DEFAULT 'KUB',
    gas_used        NUMERIC(38, 18),
    gas_price       NUMERIC(38, 18),
    status          VARCHAR(10) NOT NULL DEFAULT 'success',
    block_timestamp TIMESTAMP NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tx_wallet ON transaction(wallet_address);
CREATE INDEX idx_tx_hash ON transaction(tx_hash);
CREATE INDEX idx_tx_block ON transaction(block_number);
CREATE INDEX idx_tx_timestamp ON transaction(block_timestamp);
CREATE INDEX idx_tx_type ON transaction(tx_type);

CREATE TABLE price_history (
    id          BIGSERIAL PRIMARY KEY,
    token       VARCHAR(42) NOT NULL,
    symbol      VARCHAR(20) NOT NULL,
    price_usd   NUMERIC(24, 8) NOT NULL,
    volume_24h  NUMERIC(24, 8),
    timestamp   TIMESTAMP NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_token_time ON price_history(token, timestamp);

CREATE TABLE alert (
    id          BIGSERIAL PRIMARY KEY,
    alert_type  VARCHAR(30) NOT NULL,
    severity    VARCHAR(10) NOT NULL DEFAULT 'info',
    title       VARCHAR(200) NOT NULL,
    message     TEXT,
    wallet_address VARCHAR(42),
    tx_hash     VARCHAR(66),
    amount      NUMERIC(38, 18),
    read        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alert_type ON alert(alert_type);
CREATE INDEX idx_alert_created ON alert(created_at DESC);

CREATE TABLE staking_position (
    id              BIGSERIAL PRIMARY KEY,
    wallet_address  VARCHAR(42) NOT NULL,
    validator       VARCHAR(42),
    amount_staked   NUMERIC(38, 18) NOT NULL DEFAULT 0,
    reward_earned   NUMERIC(38, 18) NOT NULL DEFAULT 0,
    staked_at       TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staking_wallet ON staking_position(wallet_address);
