# Project Documentation

This folder contains architecture documentation for the project.

- Architecture Component Diagram (C4 Container level): `architecture-component-diagram.puml`
- C4 Deployment Diagram: `c4-deployment-diagram.puml`
- Classic Deployment Diagram: `deployment-diagram.puml`

Rendering instructions:
- Use any PlantUML-compatible renderer or IDE plugin (e.g., IntelliJ IDEA, WebStorm, VS Code) to preview the `.puml` files.
- The C4 diagrams reference C4-PlantUML via remote include URLs. Ensure your environment allows network access for includes or install the C4-PlantUML library locally if needed.

PlantUML Plugin with Graphviz
- Install Graphviz locally (`brew install graphviz` on macOS, `choco install graphviz` on Windows).
- Ensure PlantUML plugin can find dot executable (needed for layout).
- This setup gives the best rendering quality.

---

Local Core Data & Messaging Stack (UNT)

This repository includes a local Docker Compose stack to run the Milestone 5 technologies on your workstation for UNT (unit/local) environment.

What it starts:
- Aurora PostgreSQL equivalent: postgres:15 (DB: eee_core_unt)
- ODS: DynamoDB Local + DynamoDB Admin UI
- Cache: Redis + Redis Commander UI
- Messaging: Kafka (Redpanda) + Kafka UI
- Lightweight AWS services: LocalStack (SQS/SNS)
- Outbox Publisher: minimal Node.js service publishing DB outbox events to Kafka and SQS

Folder: infra/local/UNT
- docker-compose.yml
- .env.UNT
- postgres/init/*.sql (schemas + outbox table)

How to run
1) cd infra/local/UNT
2) docker compose --env-file .env.UNT up -d --build
3) Wait ~10–20 seconds for services to become healthy.

Service endpoints (defaults)
- Postgres: localhost:5432 (db=eee_core_unt, user=postgres, pass=postgres)
- Kafka UI: http://localhost:8080
- Redis: localhost:6379; Redis Commander UI: http://localhost:8081
- DynamoDB Local: http://localhost:8000; Admin UI: http://localhost:8001
- LocalStack edge: http://localhost:4566 (SQS/SNS)

Verify components
- Postgres schema & outbox table
  Connect and list tables:
    psql postgresql://postgres:postgres@localhost:5432/eee_core_unt -c "\dn;" -c "\dt core.*"

- Insert a sample outbox event (processed by the outbox-publisher):
    psql postgresql://postgres: postgres@localhost:5432/eee_core_unt \
      -c "INSERT INTO core.outbox (aggregate_type, aggregate_id, event_type, payload, idempotency_key) VALUES ('Order','order-123','OrderCreated','{\"orderId\":\"order-123\",\"amount\":42}','order-123-created');"

  Observe
  - Kafka UI: topic eee.events.core.unt should show the message.
  - SQS (LocalStack):
      aws --endpoint-url=http://localhost:4566 --region us-east-1 sqs receive-message \
        --queue-url http://localhost:4566/000000000000/eee-core-events-unt --max-number-of-messages 10

- Redis quick test
    redis-cli -p 6379 set eee:test 123
    redis-cli -p 6379 get eee:test

- DynamoDB quick test (using Admin UI):
  - Open http://localhost:8001, create a table (e.g., eee-ods-sample-unt) with PK id (String), then add and query items.

Notes
- Naming follows eee standards (see docs/eee-enterprized-solutions-naming-standards.md). UNT env codes are used for local.
- The outbox pattern is demonstrated via core.outbox + outbox-publisher container.
- Kafka is provided by Redpanda for simplicity and runs a single broker for local use.
- For local development in WebStorm/IntelliJ: to clear "package is not installed" inspections in services/outbox-publisher, run `npm install` in that folder so node_modules exist locally (docker builds use npm ci inside the container and are unaffected).

