# Cash-Compass

A full-stack personal-finance web application that helps users track spending, set goals, receive alerts, and run forecasting/optimizations via a Python-based chatbot service.

## Key Features

- User authentication and profile management (signup, login, change password)
- Transaction tracking, summaries, and bulk import
- Goal creation, progress tracking and archiving
- Alerts and crisis monitoring (create, resolve, mark read)
- Dashboard with risk scoring and monitoring endpoints
- Python chatbot backend for forecasting, optimization and integrations

## Tech Stack

- Frontend: React (Vite) — located in the repository root `src/`
- Backend API: Node.js, Express, MongoDB (Mongoose) — `backend/src/`
- Chatbot / analytics: Python (Flask + data science libs) — `chatbot-backend/`
- Tooling: Vite, Nodemon for development

## Repo layout (important paths)

- `package.json` — frontend (Vite + React) commands and deps
- `vite.config.js`, `index.html`, `src/` — frontend app
- `backend/` — Express API, models, controllers, routes, seed scripts
  - `backend/src/server.js` — API entrypoint
  - `backend/src/config/config.js` — environment keys and defaults
  - `backend/src/models/` — Mongoose models (User, Transaction, Goal, Alert)
  - `backend/seed-*.js` — seed data scripts for quick dev DB population
- `chatbot-backend/` — Python services for forecasting and risk analysis
  - `requirements.txt` — Python dependencies
- `CashCompass_Postman_Collection.json` — Postman collection for the API

## Prerequisites

- Node.js (v18+ recommended)
- npm (comes with Node.js)
- MongoDB (local or a hosted URI)
- Python 3.8+ (for the chatbot service)

## Environment variables

Place environment variables in a `.env` file for each service where applicable.

Common variables used by the backend (see `backend/src/config/config.js`):

- `PORT` — backend port (defaults to `5000`)
- `MONGODB_URI` — MongoDB connection string (defaults to `mongodb://localhost:27017/cashcompass`)
- `JWT_SECRET` — secret used for signing JWTs
- `JWT_EXPIRE` — token expiry (example: `7d`)

Chatbot service: create `chatbot-backend/.env` as needed for third-party keys or endpoints.

Note: check `backend/src/config/config.js` for the complete defaults and CORS origins list.

## Installation & Running (Windows PowerShell examples)

1) Frontend (Vite + React)

Open a PowerShell terminal at the repo root (the folder that contains `package.json` and `src/`) and run:

```powershell
cd "c:\Users\KIIT0001\Desktop\Cash-Compass\Cash-Compass"
npm install
npm run dev
```

This starts the Vite dev server (default port shown by Vite, often `5173`).

2) Backend (Express API)

Open a separate terminal, change into the backend folder, install deps and run the dev server with nodemon:

```powershell
cd "c:\Users\KIIT0001\Desktop\Cash-Compass\Cash-Compass\backend"
npm install
npm run dev    # uses nodemon (auto-reloads)
# or to run without nodemon:
npm start
```

The backend defaults to `PORT=5000` and exposes the API under `/api/*` (health check: `GET /api/health`).

3) Chatbot / Python backend

Open a third terminal and run the chatbot service (recommended inside a virtual environment):

```powershell
cd "c:\Users\KIIT0001\Desktop\Cash-Compass\Cash-Compass\chatbot-backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

Note: `requirements.txt` includes data/ML libraries (pandas, numpy, scikit-learn, prophet, etc.). Installing `prophet` (Facebook/Meta Prophet) may require extra system dependencies on some platforms.

## Seeding the database

There are seed scripts at the repo root (`backend/seed-transactions.js`, `backend/seed-goals.js`, `backend/seed-alerts.js`). To run a seed script:

```powershell
cd "c:\Users\KIIT0001\Desktop\Cash-Compass\Cash-Compass\backend"
node seed-transactions.js
```

Run these after ensuring `MONGODB_URI` points to your dev database.

## API and Postman

- A Postman collection is included at the repository root: `CashCompass_Postman_Collection.json`.
- The API exposes routes such as `/api/auth`, `/api/dashboard`, `/api/transactions`, `/api/alerts`, and `/api/goals`.

## Folder structure

Below is a concise tree of the repository showing key files and folders. Non-essential files (node_modules, build outputs) are omitted for clarity.

```
Cash-Compass/
├─ README.md
├─ package.json                # Frontend (Vite) manifest
├─ vite.config.js
├─ index.html
├─ src/                        # Frontend React app
│  ├─ main.jsx
│  ├─ App.jsx
│  ├─ index.css
│  ├─ components/
│  │  ├─ Navbar.jsx
│  │  ├─ Hero.jsx
│  │  ├─ ChatbotWidget.jsx
│  │  └─ ...
│  ├─ pages/
│  │  ├─ Dashboard.jsx
│  │  ├─ TransactionsPage.jsx
│  │  ├─ GoalsPage.jsx
│  │  └─ ...
│  └─ services/
│     └─ api.js
├─ CashCompass_Postman_Collection.json
├─ backend/                    # Express API
│  ├─ package.json
│  ├─ README.md
│  ├─ seed-transactions.js
│  ├─ seed-goals.js
│  ├─ seed-alerts.js
│  └─ src/
│     ├─ server.js
│     ├─ config/
│     │  ├─ config.js
│     │  └─ database.js
│     ├─ controllers/
│     │  ├─ authController.js
│     │  ├─ dashboardController.js
│     │  └─ ...
│     ├─ models/
│     │  ├─ User.js
│     │  ├─ Transaction.js
│     │  └─ ...
│     └─ routes/
│        ├─ authRoutes.js
│        └─ transactionRoutes.js
└─ chatbot-backend/             # Python forecasting & chatbot
  ├─ requirements.txt
  ├─ main.py
  ├─ forecaster.py
  └─ data.py
```

## Development notes

- Frontend API calls are centralized in `src/services/api.js` — check it to see exact endpoints and how auth tokens are handled.
- Backend configuration and defaults live in `backend/src/config/config.js`.
- The backend provides useful routes for dashboard summaries, risk scoring, monitoring, alerts management, and goal actions (see `backend/src/server.js` for a list).

## Contributing

- Pull requests are welcome. Open an issue if you plan a large feature so we can coordinate.
- Follow existing style and linting patterns (if added later).

## Troubleshooting

- If the backend cannot connect to MongoDB, verify `MONGODB_URI`, that MongoDB is running, and network/firewall settings.
- If the chatbot Python dependencies fail to install (especially `prophet`), consult the package documentation for system prerequisites.

