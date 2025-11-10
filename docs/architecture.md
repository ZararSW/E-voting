# System Architecture (Mermaid)

```mermaid
flowchart LR
  subgraph Frontend
    A[React Static Web App]
  end
  subgraph Azure
    B[Static Web Apps Auth]
    C[Azure Functions (API)]
    D[Azure Cosmos DB]
    E[Azure Blob Storage]
  end
  A -->|Authentication| B
  A -->|API calls| C
  B --> C
  C --> D
  C --> E

  click D "https://learn.microsoft.com/azure/cosmos-db/" "Azure Cosmos DB"
```

Data flow:
- User logs in via Static Web Apps auth (GitHub/Microsoft).
- Frontend requests /.auth/me to obtain user identity.
- Frontend calls API endpoints in Azure Functions.
- Functions read/write elections and votes in Cosmos DB.

Notes:
- Admin authorization is enforced by checking the authenticated user's email against `ADMIN_EMAILS`.
- Real-time updates are implemented with short polling (can be upgraded to websockets/Durable Functions if needed).
