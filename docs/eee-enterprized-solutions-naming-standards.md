# EEE / Enterprized — Master Naming Convention

**Scope**: GitHub repos, branches, CI/CD, DNS, TLS, AWS accounts & resources, observability, secrets, and auth.  
**Org code**: `eee` (Elgineering)  
**App code**: `ent` (Enterprized Solutions)  
**Environments**:
- `UNT` (local unit testing)
- `DVT` (development test)
- `SIT` (staging / integration test)
- `PRP` (primary production)

---

## 1. Variables & Tokens

- `{org}` → `eee`
- `{app}` → `ent`
- `{env}` → `unt`, `dvt`, `sit`, `prp`
- `{ENV}` → uppercase `UNT`, `DVT`, `SIT`, `PRP` (for tags)
- `{region}` → region short code (`use1` = `us-east-1`)
- `{svc}` → bounded context / service (`router`, `usersvc`, `billingsvc`)
- `{comp}` → infra component (`vpc`, `alb`, `cf`, `rds`, etc.)
- `{seq}` → optional numeric suffix

**Global Pattern**  
{org}-{app}-{comp}-{env}-{region}-{seq?}

---

## 2. AWS Accounts & Hosted Zones

- `EEE-Shared` → Shared networking, perimeter, DNS
- `EEE-Enterprized-DVT` → Development Test
- `EEE-Enterprized-SIT` → Staging / Integration
- `EEE-Enterprized-PRP` → Primary Production
- Route 53 Public Zone → `elgineering.com`
- Route 53 Private Zone (optional) → `svc.elg`

---

## 3. DNS & TLS Patterns

- SPA: `{env}.enterprized.elgineering.com`
    - Examples: `dvt.enterprized.elgineering.com`, `prp.enterprized.elgineering.com`
- API: `{env}.api.elgineering.com`
- CDN: `{env}.cdn.elgineering.com`
- ACM Certificates:
    - Wildcard: `*.elgineering.com`
    - Per-env optional: `*.dvt.elgineering.com`

---

## 4. S3 and CloudFront

- SPA Bucket: `eee-ent-spa-{env}-{region}`
- Assets Bucket: `eee-ent-assets-{env}-{region}`
- CloudFront Distribution Name: `eee-ent-cf-spa-{env}-{region}`
- Logs Bucket: `eee-ent-logs-{env}-{region}`

---

## 5. Networking & Load Balancers

- VPC: `eee-ent-vpc-{env}-{region}`
- Subnet: `eee-ent-subnet-{tier}-{az}-{env}-{region}`
- Internet Gateway: `eee-ent-igw-{env}-{region}`
- NAT Gateway: `eee-ent-natgw-{az}-{env}-{region}`
- Route Table: `eee-ent-rtb-{tier}-{env}-{region}`
- Security Groups:
    - ALB: `eee-ent-sg-alb-{env}`
    - App: `eee-ent-sg-app-{env}`
    - DB: `eee-ent-sg-db-{env}`
- Public ALB (API): `eee-ent-alb-api-{env}-{region}`
- Internal ALB/NLB: `eee-ent-alb-int-{env}-{region}`
- Target Group: `eee-ent-tg-{comp}-{env}`
- WAF: `eee-ent-waf-{env}`

---

## 6. Compute (ECS, ECR, App Runner)

- ECS Cluster: `eee-ent-ecs-{env}-{region}`
- ECS Service (Router): `eee-ent-svc-router-{env}`
- ECS Service (per context): `eee-ent-svc-{svc}-{env}`
- Task Definition: `eee-ent-task-{svc}-{env}`
- ECR Repository: `eee/ent/{svc}`
- ECR Tag: `{gitsha}-{env}`
- App Runner Service: `eee-ent-ar-{svc}-{env}`

---

## 7. Data Stores & Migrations

- RDS Instance: `eee-ent-rds-core-{env}-{region}`
- RDS ODS/Replica: `eee-ent-rds-ods-{env}-{region}`
- RDS DB Name: `ent_core_{env}`
- Cache: `eee-ent-cache-{env}-{region}`
- Migration Runner: `eee-ent-migrator-{env}`
- Migration File: `db/migrations/{env}/YYYYMMDDHHMM__desc.sql`
- Schema History: `schema_history_ent_{env}`

---

## 8. Secrets & Parameters

- Secrets Manager (DB): `eee/ent/db/core/{env}`
- Secrets Manager (Auth0): `eee/ent/auth0/{client}/{env}`
- External API Secret: `eee/ent/ext/{system}/{env}`
- SSM Parameters: `/eee/ent/{env}/{scope}/{key}`
- KMS Key Alias: `alias/eee-ent-kms-{env}`

---

## 9. Observability

- Log Group (Router): `/eee/ent/router/{env}`
- Log Group (Service): `/eee/ent/{svc}/{env}`
- Trace Service: `eee-ent-{svc}-{env}`
- Logs Bucket: `eee-ent-logs-{env}-{region}`
- Dashboard: `eee-ent-dash-{env}`
- Alarm: `eee-ent-{metric}-{svc}-{env}`

---

## 10. CI/CD and GitHub

- Branch to Env:
    - `develop` → DVT
    - `staging` → SIT
    - `main` → PRP
- GitHub Environments: `UNT`, `DVT`, `SIT`, `PRP`
- OIDC IAM Role: `eee-ent-gha-deploy-{env}`
- SPA Artifact: `releases/{gitsha}`
- Workflow File: `deploy-ent-{env}.yml`

---

## 11. GraphQL Federation & APIs

- Apollo Router Service ID: `ent-router-{env}`
- Subgraph Name: `{context}@eee-ent-{context}-{env}`
- GraphQL Path: `/graphql`
- REST Base Path: `/v1/{resource}`

---

## 12. Auth0

- SPA App: `EEE-ENT-SPA-{ENV}`
- API App: `EEE-ENT-API-{ENV}`
- Callback: `https://{env}.enterprized.elgineering.com/callback`
- Allowed Origin: `https://{env}.enterprized.elgineering.com`
- Claims Namespace: `https://elgineering.com/{claim}` (e.g. `/roles`)

---

## 13. Tagging Standard

- `Environment` = `UNT` \| `DVT` \| `SIT` \| `PRP`
- `Org` = `EEE`
- `App` = `Enterprized`
- `AppCode` = `ENT`
- `Owner` = `Elgineering`
- `CostCenter` = `ENT-{ENV}`
- `DataClass` = `Public` \| `Internal` \| `Confidential` \| `Restricted`
- `Compliance` = `N/A` \| `SOX` \| `PCI` \| `HIPAA`
- `GitRepo` = `github.com/Elgineering/EnterprizedSolutions`

---

## 14. Examples by Environment

- **DVT**
    - SPA: `dvt.enterprized.elgineering.com`
    - API: `dvt.api.elgineering.com`
    - ECS Cluster: `eee-ent-ecs-dvt-use1`
    - RDS: `eee-ent-rds-core-dvt-use1`
    - SPA Bucket: `eee-ent-spa-dvt-use1`
    - Router Service: `eee-ent-svc-router-dvt`

- **SIT**
    - SPA: `sit.enterprized.elgineering.com`
    - API: `sit.api.elgineering.com`
    - ECS Cluster: `eee-ent-ecs-sit-use1`
    - RDS: `eee-ent-rds-core-sit-use1`
    - SPA Bucket: `eee-ent-spa-sit-use1`
    - Router Service: `eee-ent-svc-router-sit`

- **PRP**
    - SPA: `prp.enterprized.elgineering.com`
    - API: `prp.api.elgineering.com`
    - ECS Cluster: `eee-ent-ecs-prp-use1`
    - RDS: `eee-ent-rds-core-prp-use1`
    - SPA Bucket: `eee-ent-spa-prp-use1`
    - Router Service: `eee-ent-svc-router-prp`

---

## 15. Rules

1. Env first in DNS, env inside AWS resource names.
2. Use lowercase with hyphens for AWS resource identifiers (S3, ECS, etc.).
3. Use uppercase env for tags.
4. Secrets and parameters always under `/eee/ent/{env}`.
5. Don’t create public DNS for `UNT` (local only).

---

### Sample Terraform Snippets

```hcl
variable "org"    { default = "eee" }
variable "app"    { default = "ent" }
variable "env"    { validation { condition = contains(["dvt","sit","prp"], var.env) error_message = "env must be dvt|sit|prp" } }
variable "region" { default = "us-east-1" }
locals {
  region_code = "use1"
}
```
SPA:
```resource "aws_route53_record" "spa" {
  zone_id = var.zone_id
  name    = "${var.env}.enterprized.elgineering.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.spa.domain_name
    zone_id                = aws_cloudfront_distribution.spa.hosted_zone_id
    evaluate_target_health = false
  }
}
```
API:
```resource "aws_route53_record" "api" {
  zone_id = var.zone_id
  name    = "${var.env}.api.elgineering.com"
  type    = "A"
  alias {
    name                   = aws_lb.api_alb.dns_name
    zone_id                = aws_lb.api_alb.zone_id
    evaluate_target_health = true
  }
}
```
