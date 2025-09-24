# EEE / Enterprized — Master Naming Convention

**Scope**: GitHub repos, branches, CI/CD, DNS, TLS, AWS accounts & resources, observability, secrets, and auth.  
**Org code**: `eee` (Elgineering)  
**App code**: `ezs` (EnterpriZed Solutions)  
**Environments**:
- `UNT` (local unit testing)
- `DVT` (development test)
- `SIT` (staging / integration test)
- `PRP` (primary production)

---

## 1. Variables & Tokens

- `{org}` → `eee`
- `{app}` → `ezs`
- `{env}` → `unt`, `dvt`, `sit`, `prp`
- `{ENV}` → uppercase `UNT`, `DVT`, `SIT`, `PRP` (for tags)
- `{region}` → region short code (`use2` = `us-east-2`)
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
- Route 53 Private Zone (optional) → `svc.eee`

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

- SPA Bucket: `eee-ezs-spa-{env}-{region}`
- Assets Bucket: `eee-ezs-assets-{env}-{region}`
- CloudFront Distribution Name: `eee-ezs-cf-spa-{env}-{region}`
- Logs Bucket: `eee-ezs-logs-{env}-{region}`

---

## 5. Networking & Load Balancers

- VPC: `eee-ezs-vpc-{env}-{region}`
- Subnet: `eee-ezs-subnet-{tier}-{az}-{env}-{region}`
- Internet Gateway: `eee-ezs-igw-{env}-{region}`
- NAT Gateway: `eee-ezs-natgw-{az}-{env}-{region}`
- Route Table: `eee-ezs-rtb-{tier}-{env}-{region}`
- Security Groups:
    - ALB: `eee-ezs-sg-alb-{env}`
    - App: `eee-ezs-sg-app-{env}`
    - DB: `eee-ezs-sg-db-{env}`
- Public ALB (API): `eee-ezs-alb-api-{env}-{region}`
- Internal ALB/NLB: `eee-ezs-alb-int-{env}-{region}`
- Target Group: `eee-ezs-tg-{comp}-{env}`
- WAF: `eee-ezs-waf-{env}`

---

## 6. Compute (ECS, ECR, App Runner)

- ECS Cluster: `eee-ezs-ecs-{env}-{region}`
- ECS Service (Router): `eee-ezs-svc-router-{env}`
- ECS Service (per context): `eee-ezs-svc-{svc}-{env}`
- Task Definition: `eee-ezs-task-{svc}-{env}`
- ECR Repository: `eee/ezs/{svc}`
- ECR Tag: `{gitsha}-{env}`
- App Runner Service: `eee-ezs-ar-{svc}-{env}`

---

## 7. Data Stores & Migrations

- RDS Instance: `eee-ezs-rds-core-{env}-{region}`
- RDS ODS/Replica: `eee-ezs-rds-ods-{env}-{region}`
- RDS DB Name: `ezs_core_{env}`
- Cache: `eee-ezs-cache-{env}-{region}`
- Migration Runner: `eee-ezs-migrator-{env}`
- Migration File: `db/migrations/{env}/YYYYMMDDHHMM__desc.sql`
- Schema History: `schema_history_ezs_{env}`

---

## 8. Secrets & Parameters

- Secrets Manager (DB): `eee/ezs/db/core/{env}`
- Secrets Manager (Auth0): `eee/ezs/auth0/{client}/{env}`
- External API Secret: `eee/ezs/ext/{system}/{env}`
- SSM Parameters: `/eee/ezs/{env}/{scope}/{key}`
- KMS Key Alias: `alias/eee-ezs-kms-{env}`

---

## 9. Observability

- Log Group (Router): `/eee/ezs/router/{env}`
- Log Group (Service): `/eee/ezs/{svc}/{env}`
- Trace Service: `eee-ezs-{svc}-{env}`
- Logs Bucket: `eee-ezs-logs-{env}-{region}`
- Dashboard: `eee-ezs-dash-{env}`
- Alarm: `eee-ezs-{metric}-{svc}-{env}`

---

## 10. CI/CD and GitHub

- Branch to Env:
    - `develop` → DVT
    - `staging` → SIT
    - `main` → PRP
- GitHub Environments: `UNT`, `DVT`, `SIT`, `PRP`
- OIDC IAM Role: `eee-ezs-gha-deploy-{env}`
- SPA Artifact: `releases/{gitsha}`
- Workflow File: `deploy-ezs-{env}.yml`

---

## 11. GraphQL Federation & APIs

- Apollo Router Service ID: `ezs-router-{env}`
- Subgraph Name: `{context}@eee-ezs-{context}-{env}`
- GraphQL Path: `/graphql`
- REST Base Path: `/v1/{resource}`

---

## 12. Auth0

- SPA App: `EEE-EZS-SPA-{ENV}`
- API App: `EEE-EZS-API-{ENV}`
- Callback: `https://{env}.enterprized.elgineering.com/callback`
- Allowed Origin: `https://{env}.enterprized.elgineering.com`
- Claims Namespace: `https://elgineering.com/{claim}` (e.g. `/roles`)

---

## 13. Tagging Standard

- `Environment` = `UNT` \| `DVT` \| `SIT` \| `PRP`
- `Org` = `EEE`
- `App` = `Enterprized`
- `AppCode` = `EZS`
- `Owner` = `Elgineering`
- `CostCenter` = `EZS-{ENV}`
- `DataClass` = `Public` \| `Internal` \| `Confidential` \| `Restricted`
- `Compliance` = `N/A` \| `SOX` \| `PCI` \| `HIPAA`
- `GitRepo` = `github.com/Elgineering/EnterprizedSolutions`

---

## 14. Examples by Environment

- **DVT**
    - SPA: `dvt.enterprized.elgineering.com`
    - API: `dvt.api.elgineering.com`
    - ECS Cluster: `eee-ezs-ecs-dvt-use2`
    - RDS: `eee-ezs-rds-core-dvt-use2`
    - SPA Bucket: `eee-ezs-spa-dvt-use2`
    - Router Service: `eee-ezs-svc-router-dvt`

- **SIT**
    - SPA: `sit.enterprized.elgineering.com`
    - API: `sit.api.elgineering.com`
    - ECS Cluster: `eee-ezs-ecs-sit-use2`
    - RDS: `eee-ezs-rds-core-sit-use2`
    - SPA Bucket: `eee-ezs-spa-sit-use2`
    - Router Service: `eee-ezs-svc-router-sit`

- **PRP**
    - SPA: `prp.enterprized.elgineering.com`
    - API: `prp.api.elgineering.com`
    - ECS Cluster: `eee-ezs-ecs-prp-use2`
    - RDS: `eee-ezs-rds-core-prp-use2`
    - SPA Bucket: `eee-ezs-spa-prp-use2`
    - Router Service: `eee-ezs-svc-router-prp`

---

## 15. Rules

1. Env first in DNS, env inside AWS resource names.
2. Use lowercase with hyphens for AWS resource identifiers (S3, ECS, etc.).
3. Use uppercase env for tags.
4. Secrets and parameters always under `/eee/ezs/{env}`.
5. Don’t create public DNS for `UNT` (local only).

---

### Sample Terraform Snippets

```hcl
variable "org"    { default = "eee" }
variable "app"    { default = "ezs" }
variable "env"    { validation { condition = contains(["dvt","sit","prp"], var.env) error_message = "env must be dvt|sit|prp" } }
variable "region" { default = "us-east-2" }
locals {
  region_code = "use2"
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
