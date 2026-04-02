# TaskRail

A simple task manager web app built to demonstrate PaaS deployment on [Railway](https://railway.app).

## Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Railway-managed)
- **Templating**: EJS
- **Deployment**: Railway (PaaS) with GitHub CI/CD

## Features
- Create tasks
- Mark tasks complete / incomplete
- Delete tasks
- Data persisted in PostgreSQL

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env` and fill in your local Postgres URL:
   ```bash
   cp .env .env.local
   ```

3. Run the app:
   ```bash
   npm start
   ```

## Deployment (Railway)

1. Push this repo to GitHub.
2. On [railway.app](https://railway.app), create a new project → **Deploy from GitHub repo**.
3. Add a **PostgreSQL** plugin inside the project.
4. Railway auto-injects `DATABASE_URL` — no manual config needed.
5. Every `git push` triggers an automatic redeployment.
