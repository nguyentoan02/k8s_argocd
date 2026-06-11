# W9 Monitoring + Canary

## Scope

This repo extends the morning GitOps lab with:

- `kube-prometheus-stack` via ArgoCD app-of-apps
- `argo-rollouts` via ArgoCD app-of-apps
- `demo-api` as a `Rollout`
- `demo-web` as a simple frontend
- `ServiceMonitor` for Prometheus scraping
- `PrometheusRule` for SLO-style alerting
- `AnalysisTemplate` for canary auto-judgement

## Repo map

Key paths:

- `argocd/apps/`
- `k8s-api/`
- `k8s-web/`
- `app/api/`
- `app/web/`

## Runtime design

### Frontend

- service: `demo-web`
- purpose: generate user traffic and show backend version/error state

### Backend

- service: `demo-api`
- framework: Flask
- endpoints:
  - `/healthz`
  - `/api/config`
  - `/api/info`
  - `/metrics`

## GitOps flow

The repo keeps the morning `root` application and adds child applications in `argocd/apps/`.

Application order is enforced with sync waves:

- wave `0`: `kube-prometheus-stack`, `argo-rollouts`
- wave `1`: `demo-api`
- wave `2`: `demo-web`

This avoids the frontend booting before `demo-api` DNS/service exists.

## Build and load images

For Git Bash:

```bash
cd /d/Gitops_W9
export MINIKUBE_PROFILE=minikube
./build-minikube-images.sh
```

Images:

- `w9-demo-api:1`
- `w9-demo-web:1`

## Verification

### Open frontend in cluster

```powershell
kubectl -n demo port-forward svc/demo-web 8081:80
```

Open:

- `http://localhost:8081`

Generate traffic with:

- `Call API`
- `Burst x20`

### Open Prometheus

```powershell
kubectl -n monitoring port-forward svc/kube-prometheus-stack-prometheus 9090:9090
```

Open:

- `http://localhost:9090`

## Prometheus queries

### Request count

```promql
flask_http_request_total{namespace="demo",service="demo-api"}
```

### Request rate

```promql
sum(rate(flask_http_request_total{namespace="demo",service="demo-api"}[1m]))
```

### 5xx error rate

```promql
sum(rate(flask_http_request_total{namespace="demo",service="demo-api",status=~"5.."}[1m]))
/
clamp_min(sum(rate(flask_http_request_total{namespace="demo",service="demo-api"}[1m])), 0.001)
```

### Success rate used by canary logic

```promql
sum(rate(flask_http_request_total{namespace="demo",service="demo-api",status!~"5.."}[1m]))
/
clamp_min(sum(rate(flask_http_request_total{namespace="demo",service="demo-api"}[1m])), 0.001)
```

## SLO and alerting

Target idea:

- availability SLO: `99%`
- error budget: `1%`

Implemented file:

- `k8s-api/prometheus-rule.yaml`

Alerts:

- `DemoApiHighErrorRateFastBurn`
- `DemoApiHighErrorRateSlowBurn`

Thresholds:

- fast burn: `14.4x` budget on `5m` and `1h`
- slow burn: `6x` budget on `30m` and `6h`

These follow the multi-window burn-rate direction from the afternoon slide.

## Canary logic

Implemented files:

- `k8s-api/rollout.yaml`
- `k8s-api/analysis-template.yaml`

Canary steps:

1. `25%`
2. wait `60s`
3. `50%`
4. wait `60s`
5. `100%`

The `AnalysisTemplate` judges success rate from Prometheus.

Current success condition:

- success rate `>= 95%`

## Demo plan

### Good release

1. build a new backend image tag
2. change version or image in Git
3. merge
4. verify rollout reaches `100%`

### Bad release

1. inject error with `ERROR_RATE=0.3` or higher
2. build a new backend image tag
3. update Git
4. merge
5. observe canary fail and stop/abort

## Rollback

Rollback remains Git-first:

```bash
git revert <commit>
git push
```

This keeps the GitOps source of truth intact.

## Remaining gap for a full challenge submission

What is already present:

- rollout
- analysis template
- service monitor
- SLO-style alert rules
- README with queries and thresholds

What still needs real environment-specific setup if required by mentor:

- personal email receiver wiring in Alertmanager
- screenshots or clip proving auto-abort
- one explicit bad release demo commit
