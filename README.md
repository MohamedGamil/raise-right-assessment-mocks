# Raise Right - Mock Backends

## Requirements
- Node 18+
- npm

## Installation
Simply run: `npm install`

## Running Mock APIs Servers
- **REST**: `npm run start:rest` (default http://localhost:4000)
- **GraphQL**: `npm run start:graphql` (default http://localhost:4001)
- **WebSocket**: `npm run start:ws` (default ws://localhost:4002)

- **Or start all at once:**
    ```bash
    npx concurrently "npm:serve-rest" "npm:serve-graphql" "npm:serve-ws"
    ```


## Mock Endpoints
- **REST**
  - `GET /api/campaigns` — list campaigns
  - `GET /api/campaigns/:id` — campaign by id
  - `POST /api/campaigns/:id/donate` — body `{ amount: number, donor?: string }` updates in-memory

- **GraphQL**
  - Query example:
    ```
    query getCampaignDetails($id: ID!) {
      campaign(id: $id) {
        id
        name
        goal
        currentAmount
        description
        donors { name amount }
      }
    }
    ```

  - Important: The GraphQL server is instrumented to sometimes return partial results accompanied by an `errors` array (HTTP 200). Clients must check `response.errors` and still render available `data`.

- **WebSocket**
  - Connect to: `ws://localhost:4002`
  - Server sends periodic `donation` events:
    ```json
    { "type": "donation", "campaignId": "1", "amount": 50, "donor": "system", "id": "...", "timestamp": 123456 }
    ```
  - Client can send a donation message to propagate it to all connected clients:
    ```json
    { "type": "donation", "campaignId": "1", "amount": 25, "donor": "Candidate" }
    ```

## Notes for candidates
- GraphQL responses may include `errors` while also returning `data`. Show available fields and display a non-blocking warning if `errors` exists.
- WebSocket donation messages should update UI in real-time **without full reload**.
