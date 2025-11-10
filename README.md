# University Clubs E-Voting (Azure Serverless)

This repository provides a complete, serverless E-Voting system for university clubs built on Azure. It is designed for easy deployment with GitHub Actions and to work with free/student Azure subscriptions.

Folders
- `/frontend` - React app (Static Web App)
- `/backend` - Azure Functions API
- `/docs` - architecture and UML diagrams
- `/.github/workflows` - GitHub Actions deployment workflow

Quick overview
1. Configure repo secrets (see README Deploy section).
2. Push to GitHub; the workflow will build and deploy to Azure Static Web Apps and provision (optional) Cosmos DB via Azure CLI/ARM.

Features
- Admins can create elections and add candidates
- Students can log in using GitHub/Microsoft and vote once per election
- Votes stored in Azure Cosmos DB
- Admins can see live tallies

See `docs/architecture.md` for diagram and `README` sections below for step-by-step deployment.
