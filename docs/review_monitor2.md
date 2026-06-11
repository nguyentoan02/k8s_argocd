# Review monitor - phase 3

## Objective

Close the remaining mentor criteria for the afternoon project:

1. changes go through Git, ArgoCD stays synced, and the system is reproducible from Git
2. `git revert` rollback is demonstrated in under 5 minutes
3. one SLO and one alert fire to a personal email when faults are injected
4. a bad canary release auto-aborts back to the previous stable version

Target email receiver:

- `nvtvlog234@gmail.com`

Configured sender assumption:

- `nvtvlog234@gmail.com`

## Current status against the 4 criteria

### 1. GitOps + synced + reproducible

Status: mostly done

What is already in place:

- `root` app-of-apps is working
- `demo-api`, `demo-web`, `kube-prometheus-stack` are deployed via Git
- the cluster can be reproduced from manifests in this repository
- frontend/backend are running in Kubernetes

Gap:

- `argo-rollouts` still shows CRD drift in ArgoCD UI
- functionally it works, but this is still visual drift

### 2. `git revert` rollback under 5 minutes

Status: not yet demonstrated

What exists:

- Git-first rollback flow is documented
- ArgoCD is already reconciling from Git

What is missing:

- one real revert operation on a release commit
- one proof capture showing ArgoCD reconciling back to the previous state

### 3. one SLO + one alert firing to personal email

Status: wiring added, fire proof still required

What exists:

- SLO-style Prometheus rules already exist in `k8s-api/prometheus-rule.yaml`
- Prometheus is scraping `demo-api`
- Alertmanager email receiver is configured for `nvtvlog234@gmail.com`

What is missing:

- a real alert that reaches `nvtvlog234@gmail.com`
- proof after injecting faults

### 4. bad canary release auto-aborts

Status: foundation is done, proof is missing

What exists:

- `Rollout`
- `AnalysisTemplate`
- successful canary flow for good release `v2`

What is missing:

- one bad release, for example `v3-bad`
- observed `AnalysisRun` failure
- observed rollout stop/abort instead of promoting to 100%

## What should be completed next

Priority order:

1. finish bad release auto-abort
2. finish Git rollback proof
3. verify Alertmanager email delivery

Reason:

- criterion 4 is the most important one from the mentor note
- criterion 2 is easy to demonstrate once a bad release exists
- criterion 3 now depends on live cluster verification, not missing configuration

## Remaining implementation plan

### A. Bad release for auto-abort

Goal:

- create a backend release that intentionally degrades quality
- let the current `AnalysisTemplate` detect low success rate
- confirm the rollout does not fully promote

Suggested release shape:

- image: `w9-demo-api:4`
- version: `v4-bad`
- `ERROR_RATE: "1.0"`

Files involved:

- `k8s-api/rollout.yaml`

Recommended manifest changes:

```yaml
image: w9-demo-api:4
env:
  - name: VERSION
    value: v4-bad
  - name: ERROR_RATE
    value: "1.0"
```

Build/load command:

```bash
cd /d/Gitops_W9
export MINIKUBE_PROFILE=minikube
export API_IMAGE=w9-demo-api:4
./build-minikube-images.sh
```

Release verification:

```powershell
kubectl -n demo describe rollout demo-api
kubectl -n demo get analysisrun
kubectl -n demo describe analysisrun
```

Expected proof:

- `AnalysisRun` becomes `Failed`
- rollout remains paused, degraded, or aborted
- the bad revision does not become the only stable revision

### B. Git revert rollback proof

Goal:

- prove the system returns to the previous good state through Git only

Command flow:

```bash
git revert <bad-release-commit>
git push
```

Verification:

```powershell
kubectl -n argocd get applications
kubectl -n demo describe rollout demo-api
kubectl -n demo get rollout,pods
```

Expected proof:

- ArgoCD syncs back to the previous good version
- `demo-api` returns to the stable version
- frontend calls return healthy responses again

### C. Alertmanager email verification

Goal:

- route one alert to `nvtvlog234@gmail.com`

Configured files:

- `argocd/apps/monitoring-config.yaml`
- `k8s-monitoring/alertmanager-email-secret.yaml`

Configured SMTP:

- host: `smtp.gmail.com:587`
- sender: `nvtvlog234@gmail.com`
- receiver: `nvtvlog234@gmail.com`

Verification after merge and sync:

```powershell
kubectl -n monitoring get secret alertmanager-email-config
kubectl -n monitoring port-forward svc/kube-prometheus-stack-alertmanager 9093:9093
```

Then:

1. inject errors in `demo-api`
2. keep traffic running
3. verify alert goes `Pending` then `Firing` in Prometheus
4. confirm email arrives in `nvtvlog234@gmail.com`

To make the email fire quickly during the demo, the repo now includes:

- `DemoApiHighErrorRateDemo`

This alert fires when:

- 5xx error ratio is greater than `20%`
- measured over `1m`
- sustained for `30s`

This is intentionally more demo-friendly than the slower multi-window burn-rate alerts.

## Proof package to capture for mentor

### Proof 1. GitOps overview

Capture:

- ArgoCD application overview showing `root`, `monitoring-config`, `kube-prometheus-stack`, `argo-rollouts`, `demo-api`, `demo-web`

### Proof 2. Frontend and backend running

Capture:

- `demo-web` UI showing successful backend calls

### Proof 3. Metrics in Prometheus

Capture:

- query:

```promql
flask_http_request_total{namespace="demo",service="demo-api"}
```

### Proof 4. Good release canary

Capture:

- `Rollout` or `AnalysisRun` while `v2` is progressing

### Proof 5. Bad release auto-protect

Capture:

- `AnalysisRun` failure
- rollout not promoting fully

### Proof 6. Git rollback

Capture:

- `git revert` commit
- ArgoCD syncing back to the previous good state

### Proof 7. Alert delivery

Capture:

- Prometheus alert `Firing`
- email received at `nvtvlog234@gmail.com`

## Recommended next execution sequence

### Step 1

Build and load `w9-demo-api:4`

### Step 2

Push and merge the `v3-bad` release

### Step 3

Open `demo-web` and create continuous traffic

### Step 4

Capture `AnalysisRun` and rollout failure evidence

### Step 5

Run `git revert` and capture recovery

### Step 6

Confirm the alert email arrives

## Final assessment

What is already strong:

- GitOps architecture
- monitoring stack
- Prometheus scraping
- SLO-style rules
- Alertmanager email wiring
- canary rollout for good release

What still decides whether the project fully meets the mentor target:

- bad release auto-abort proof
- Git rollback proof
- real email alert delivery to `nvtvlog234@gmail.com`
