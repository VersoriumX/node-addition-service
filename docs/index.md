---
layout: page
title: Documentation
---

# VersoriumX Documentation

Welcome to the VersoriumX documentation. This guide will help you understand how to use and extend the VersoriumX framework.

## Introduction

VersoriumX is a modular framework for building financial and asset-tracking dashboards. It combines a Node.js backend with a lightweight, component-based frontend.

## Architecture

The framework is divided into several key parts:

### Backend (`src/`)
- **`api.js`**: Handles external API calls (Metals, Crypto).
- **`tokenmanager.js`**: Manages local token data and persistence.
- **`database.js`**: Simple JSON-based storage for token data.
- **`config.js`**: Centralized configuration for API keys and settings.

### Frontend (`public/`)
- **`js/app.js`**: Main entry point for the frontend logic.
- **`js/charts.js`**: Chart.js integration for data visualization.
- **`js/wallet.js`**: Web3 wallet connection logic.
- **`css/style.css`**: Modern, dark-themed styling.

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/versoriumx/versoriumx-framework.git
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Configure API Keys**:
   Edit `src/config.js` and add your API keys for Metals-API and CoinMarketCap.

4. **Start the server**:
   ```bash
   yarn start
   ```

## Modular Upgrades

To add a new tracking module:
1. Add the data fetching logic in `src/api.js`.
2. Create a new API endpoint in `server.js`.
3. Update `public/js/charts.js` to handle the new data type.
4. Add the UI element in `public/index.html`.
