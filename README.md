# Raise Right - Mock Backends

## Requirements
- Node 18+
- npm

## Installation
Simply run: `npm install`

## Running Mock APIs Servers
- Start servers using `npm run start:all`
- **REST**: `http://localhost:4000/api/campaigns`
- **GraphQL**: `http://localhost:4000/graphql`
- **WebSocket**: `ws://localhost:4000/ws`

- **Alternatively, use docker to quickly run all mock APIs:**
    ```bash
    docker compose up --build -d
    ```

- *To quickly test APIs connections, you may use the following commands:*
    ```bash
    # Test RESTful API
    curl http://localhost:4000/api/campaigns

    # Test GraphQL API
    curl -X POST http://localhost:4001/ \
        -H "Content-Type: application/json" \
        --data '{"query":"query ($id:ID!){ campaign(id:$id){ id name goal currentAmount description imageUrl donors{ name amount } } }","variables":{"id":"1"}}'
    ```
    > You can test Websocket API by previwing `ws-test.html` file in browser.

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
        imageUrl
        donors { name amount }
      }
    }
    ```

  - Important: The GraphQL server is instrumented to sometimes return partial results accompanied by an `errors` array (HTTP 200). Clients must check `response.errors` and still render available `data`.

- **WebSocket**
  - Connect to: `ws://localhost:4000/ws`
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
