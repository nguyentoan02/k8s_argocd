# Review monitor app - phase 2

## 1. Nhung gi toi da them

Toi da hoan thien phan tiep theo de dua app vao flow GitOps/Kubernetes:

- them app nen tang cho buoi chieu:
  - `argocd/apps/kube-prometheus-stack.yaml`
  - `argocd/apps/argo-rollouts.yaml`
- them app business:
  - `argocd/apps/api.yaml`
  - `argocd/apps/frontend.yaml`
- them manifest backend:
  - `k8s-api/analysis-template.yaml`
  - `k8s-api/rollout.yaml`
  - `k8s-api/service.yaml`
  - `k8s-api/service-monitor.yaml`
- them manifest frontend:
  - `k8s-web/deployment.yaml`
  - `k8s-web/service.yaml`
- them script build/load image:
  - `build-minikube-images.sh`
- mo rong CI validate cho cac thu muc manifest moi

## 2. Kien truc da chot

### Platform

- `kube-prometheus-stack` trong namespace `monitoring`
- `argo-rollouts` trong namespace `argo-rollouts`

Ca 2 deu duoc cai qua `root` app-of-apps, khong can `kubectl apply` tung app.
Toi da bo sung `sync-wave` o cap `Application` de `root` tao theo thu tu:

- wave `0`: `kube-prometheus-stack`, `argo-rollouts`
- wave `1`: `demo-api`
- wave `2`: `demo-web`

Ly do: tranh truong hop frontend len truoc khi service `demo-api` ton tai, lam nginx crash ngay luc boot.

### Business app

- frontend: `demo-web`
- backend: `demo-api`

Frontend:

- `Deployment`
- `Service`
- image: `w9-demo-web:1`

Backend:

- `Rollout`
- `Service`
- `ServiceMonitor`
- `AnalysisTemplate`
- image: `w9-demo-api:1`

## 3. Backend rollout

Backend duoc chuyen thanh `Rollout` de dung cho canary.

Canary steps hien tai:

1. len 25%
2. pause 60s
3. len 50%
4. pause 60s
5. len 100%

Dong thoi rollout da gan `AnalysisTemplate` ten `demo-api-success-rate`.

Y nghia:

- Prometheus se duoc query trong luc rollout
- neu success rate duoi nguong, rollout co co so de fail/abort
- buoc nay da dat nen tang cho challenge auto-abort

## 4. AnalysisTemplate

File: `k8s-api/analysis-template.yaml`

Metric hien tai:

- `success-rate`

Logic:

- lay `flask_http_request_total`
- tinh ti le request khong phai `5xx`
- nguong thanh cong: `>= 95%`

Toi co chu y:

- query nay phu thuoc Prometheus scrape duoc `demo-api`
- no phu thuoc metric name mac dinh cua `prometheus-flask-exporter`

Neu mentor muon giai thich query, day la file can dem ra.

## 5. Frontend va backend trong cluster

Frontend nginx trong image da proxy:

- `/api/*` -> `demo-api.demo.svc.cluster.local:8080`

Nghia la khi `demo-web` chay trong namespace `demo`, UI se noi thang vao service `demo-api`.

Backend service:

- service ten `demo-api`
- port `8080`

Frontend service:

- service ten `demo-web`
- port `80`

## 6. Build va nap image

Toi da them script:

- `build-minikube-images.sh`

Dung trong Git Bash:

```bash
cd /d/Gitops_W9
./build-minikube-images.sh
```

Mac dinh script:

- build `w9-demo-api:1`
- build `w9-demo-web:1`
- load vao minikube profile `w9`

Neu profile khac:

```bash
export MINIKUBE_PROFILE=minikube
./build-minikube-images.sh
```

## 7. GitOps flow sau khi merge

Sau khi image da duoc load vao minikube:

1. push repo len branch moi
2. tao PR
3. merge
4. `root` se thay app moi trong `argocd/apps/`
5. ArgoCD tu tao:
   - monitoring stack
   - argo-rollouts
   - demo-api
   - demo-web

Khong can apply tay cac app con.

## 8. CI validate

Toi da sua workflow `.github/workflows/validate.yml`:

- them trigger cho `k8s-api/**`, `k8s-web/**`, `argocd/**`
- chuyen sang:

```text
kubeconform -strict -ignore-missing-schemas
```

Ly do:

- repo moi co CRD:
  - `Application`
  - `Rollout`
  - `AnalysisTemplate`
  - `ServiceMonitor`
- neu giu `-strict` ma khong `-ignore-missing-schemas`, CI se fail vi custom schema

Tradeoff:

- van validate duoc resource built-in
- custom resource khong duoc schema-check day du trong workflow hien tai

## 9. Viec ban co the test tiep

Sau khi merge va ArgoCD sync xong, ban co the test theo thu tu:

1. `kubectl -n argocd get app`
2. `kubectl -n monitoring get pods`
3. `kubectl -n argo-rollouts get pods`
4. `kubectl -n demo get rollout,deploy,svc,pods`
5. mo `demo-web`, bam `Burst x20`
6. query Prometheus cho `flask_http_request_total`

## 10. Nhung diem toi chua lam o buoc nay

Toi chua:

- push branch len remote
- tao PR
- build image tren may ban
- apply/verify rollout tren cluster that

Ly do:

- push remote can theo branch va network thuc te cua may ban
- build/deploy that nen lam sau khi ban review file da

## 11. Ket luan

Trang thai hien tai da du cho phase tiep theo:

- app co FE/BE
- local run on
- manifest K8s da co
- app da di theo root GitOps
- backend da la `Rollout`
- da co `ServiceMonitor`
- da co `AnalysisTemplate`

Buoc tiep theo hop ly nhat la:

1. tao branch cong viec
2. build image + load minikube
3. push
4. merge PR
5. verify ArgoCD/Prometheus/Rollout tren cluster
