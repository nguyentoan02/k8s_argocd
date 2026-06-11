# Test 1 - verify monitoring + canary

Tai lieu nay la checklist de verify project theo dung flow buoi chieu:

- resource len dung
- Prometheus scrape duoc metric
- alert rule ton tai
- canary co the duoc theo doi
- rollback van di qua Git

## 1. Verify resource trong cluster

Chay:

```powershell
kubectl -n argocd get applications
kubectl -n monitoring get pods
kubectl -n demo get rollout,pods,svc
kubectl -n demo get servicemonitor
kubectl -n demo get prometheusrule
```

Mong doi:

- `kube-prometheus-stack` = `Synced/Healthy`
- `demo-api` = `Synced/Healthy`
- `demo-web` = `Synced/Healthy`
- pods trong `monitoring` deu `Running`
- co `ServiceMonitor` ten `demo-api`
- co `PrometheusRule` ten `demo-api-slo`

## 2. Mo frontend trong cluster

Chay:

```powershell
kubectl -n demo port-forward svc/demo-web 8081:80
```

Mo trinh duyet:

- `http://localhost:8081`

Mong doi:

- UI len binh thuong
- bam `Call API` duoc
- bam `Burst x20` duoc

## 3. Mo Prometheus

Chay:

```powershell
kubectl -n monitoring port-forward svc/kube-prometheus-stack-prometheus 9090:9090
```

Mo:

- `http://localhost:9090`

## 4. Verify Prometheus scrape metric

Tren frontend:

- bam `Call API`
- bam `Burst x20` vai lan

Tren Prometheus query:

### Tong request

```promql
flask_http_request_total{namespace="demo",service="demo-api"}
```

Mong doi:

- co du lieu
- so lieu tang len sau khi tao traffic

### Request rate

```promql
sum(rate(flask_http_request_total{namespace="demo",service="demo-api"}[1m]))
```

Mong doi:

- co gia tri > 0 khi dang tao traffic

### 5xx error rate

```promql
sum(rate(flask_http_request_total{namespace="demo",service="demo-api",status=~"5.."}[1m]))
/
clamp_min(sum(rate(flask_http_request_total{namespace="demo",service="demo-api"}[1m])), 0.001)
```

Mong doi:

- khi chua inject loi thi rat thap hoac gan 0

## 5. Verify alert rule da duoc nap

Tren Prometheus:

- vao tab `Alerts`

Hoac query:

```promql
ALERTS{alertname=~"DemoApiHighErrorRate.*"}
```

Mong doi:

- khi he thong binh thuong: khong `Firing`

## 6. Verify rollout hien tai

Chay:

```powershell
kubectl -n demo get rollout
kubectl -n demo describe rollout demo-api
kubectl -n demo get analysisrun
```

Neu co plugin:

```powershell
kubectl argo rollouts get rollout demo-api -n demo --watch
```

Mong doi:

- `demo-api` ton tai duoi dang `Rollout`
- rollout healthy
- analysisrun co the xuat hien khi co rollout moi

## 7. Test good release

Muc tieu:

- deploy ban tot
- canary di len duoc

Goi y:

1. doi image backend trong `k8s-api/rollout.yaml`:

```yaml
image: w9-demo-api:2
```

2. doi version:

```yaml
VERSION: v2
ERROR_RATE: "0"
```

3. build va load image moi:

```bash
cd /d/Gitops_W9
export MINIKUBE_PROFILE=minikube
export API_IMAGE=w9-demo-api:2
./build-minikube-images.sh
```

4. commit + push + merge
5. theo doi:

```powershell
kubectl -n demo describe rollout demo-api
kubectl -n demo get analysisrun
```

Mong doi:

- UI hien version `v2`
- rollout canary chay
- metric van tot
- rollout di len 100%

### Trang thai good release da duoc chuan bi san

Repo hien tai da duoc doi sang:

- `image: w9-demo-api:2`
- `VERSION: v2`
- `ERROR_RATE: "0"`

Ban chi can build image `:2`, push Git, merge, roi verify rollout.

### Commit goi y cho good release

```bash
git add k8s-api/rollout.yaml test1.md
git commit -m "release demo-api v2 for canary verification"
git push
```

## 8. Test bad release

Muc tieu:

- inject loi
- chung minh alert/analysis thay duoc van de

Goi y:

1. sua `k8s-api/rollout.yaml`
2. doi `VERSION` sang gia tri moi, vi du `v3-bad`
3. tang:

```yaml
ERROR_RATE: "0.3"
```

hoac cao hon neu can test nhanh.

4. build/load image moi neu dung image tag moi
5. commit + push + merge
6. tao traffic tren frontend

Theo doi:

```powershell
kubectl -n demo get analysisrun
kubectl -n demo describe analysisrun
kubectl -n demo describe rollout demo-api
```

Mong doi:

- success rate giam
- alert co the vao `Pending`/`Firing`
- rollout khong len dep len 100%
- co dau hieu fail/abort/dung lai de bao ve

## 9. Verify rollback

Sau khi test ban loi, rollback dung flow GitOps:

```bash
git revert <commit-bad-release>
git push
```

Mong doi:

- ArgoCD sync cluster ve ban cu
- app ve state tot

Khong dung:

```powershell
kubectl rollout undo
```

vi day khong phai rollback chuan trong flow GitOps.

## 10. Tai lieu/chung cu nen chup lai

Nen chup hoac quay lai:

- ArgoCD apps `Synced/Healthy`
- frontend `demo-web` dang goi duoc backend
- Prometheus query co metric
- tab `Alerts`
- rollout/analysisrun khi release tot
- rollout/analysisrun khi release loi
- commit `git revert` rollback

## 11. Dau ra duoc xem la dat

Duoc xem la dat khi:

1. app FE/BE chay trong cluster
2. Prometheus scrape duoc `demo-api`
3. co `ServiceMonitor`
4. co `PrometheusRule`
5. canary chay duoc voi `Rollout`
6. ban loi co the bi metric phat hien
7. rollback di qua Git
