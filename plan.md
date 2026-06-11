# Plan cho buoi chieu: app back/frontend + observability + canary

## 1. Muc tieu

Khong lam lai flow buoi sang. Tan dung thang:

- `argocd/root.yaml`
- `argocd/apps/`
- namespace `demo`
- repo Git hien tai la source of truth

Muc tieu moi la them 1 app co:

- 1 frontend
- 1 backend
- co metric de Prometheus scrape
- co canary tren backend de demo rollout an toan
- van di qua `root` app-of-apps

## 2. Huong toi chon

Toi chon app rat don gian:

- Frontend: trang web tinh, hien version, nut goi API, nut spam request
- Backend: API Flask tra JSON, co `/healthz` va `/metrics`

Stack:

- Backend: `Python Flask` + `prometheus-flask-exporter`
- Frontend: `nginx` + `HTML/CSS/JS` thuan

Ly do chon:

- trung voi flow trong slide buoi chieu
- backend Flask rat de gan metrics va inject loi de demo canary
- frontend static la du de dap ung yeu cau "co fe/be", khong can them build tool
- giam toi da khoi luong, de thoi gian tap trung vao GitOps + observability + rollout

## 3. App de xuat

Ten tam:

- `demo-api`
- `demo-web`

Chuc nang:

- `demo-web` goi `demo-api`
- man hinh hien:
  - backend version
  - so lan goi thanh cong / that bai
  - trang thai API
- `demo-api` tra:
  - `GET /api/info`
  - `GET /healthz`
  - `GET /metrics`

Bien moi truong backend:

- `VERSION`
- `ERROR_RATE`
- `RESPONSE_DELAY_MS`

Nhu vay co the demo:

- ban tot: `ERROR_RATE=0`
- ban loi: `ERROR_RATE=0.3` hoac tang delay

## 4. Cach gan vao bai lab hien tai

Khong dung lai `k8s/web.yaml` lam app chinh cho chieu. File do giu nguyen de bao toan bai sang.

Toi de xuat them moi:

- `app/api/`
- `app/web/`
- `k8s-api/`
- `k8s-web/`
- `argocd/apps/api.yaml`
- `argocd/apps/frontend.yaml`
- `argocd/apps/kube-prometheus-stack.yaml`
- `argocd/apps/argo-rollouts.yaml`

Flow se la:

1. `root` dang theo doi `argocd/apps/`
2. them file app con vao `argocd/apps/`
3. push Git
4. ArgoCD tu tao:
   - monitoring stack
   - argo-rollouts
   - frontend app
   - backend app

No van dung dung mo hinh Lab 5, khong phai doi kien truc.

## 5. Kien truc trien khai

### Nen tang

- `kube-prometheus-stack` trong namespace `monitoring`
- `argo-rollouts` trong namespace `argo-rollouts`

### App business

- `demo-web`: Deployment + Service
- `demo-api`: Rollout + Service
- `ServiceMonitor` cho `demo-api`

### Ly do chi canary backend

- backend moi la cho co metric loi/latency ro rang
- frontend static it gia tri khi canary
- nhu vay bai demo gon hon va logic hon

## 6. Muc observability toi muon lam

Muc toi thieu:

- Prometheus scrape `demo-api`
- query duoc request rate, error rate
- co dashboard Grafana don gian cho:
  - request total
  - 5xx rate
  - p95 latency neu co

Neu kip:

- them alert rule cho error rate
- them Alertmanager gui mail

Nhung voi pham vi hien tai, toi uu tien:

1. metrics chay that
2. rollout doc duoc metric
3. canary abort/promote theo metric

## 7. Muc canary toi muon lam

Backend `demo-api` se dung `Rollout` thay vi `Deployment`.

Canary plan:

- 25%
- pause
- 50%
- pause
- 100%

Hai muc thuc hien:

### Muc 1: manual promote/abort

De khop voi lab goc buoi chieu.

### Muc 2: auto-abort bang `AnalysisTemplate`

Prometheus query error rate cua `demo-api`.

Logic:

- neu error rate vuot nguong trong cua so ngan
- rollout fail
- Argo Rollouts auto-abort

Day moi la phan "hoan thien" ma mentor muon thay.

## 8. Pham vi code toi de xuat

### Backend

Can tao:

- `app/api/app.py`
- `app/api/requirements.txt`
- `app/api/Dockerfile`

Noi dung:

- Flask app
- endpoint `/api/info`
- endpoint `/healthz`
- metrics tu dong
- co inject loi dua theo env

### Frontend

Can tao:

- `app/web/index.html`
- `app/web/app.js`
- `app/web/style.css`
- `app/web/nginx.conf`
- `app/web/Dockerfile`

Noi dung:

- giao dien 1 trang
- goi `demo-api`
- hien version backend
- co nut "Call API"
- co nut "Burst x20" de tao traffic de xem metric

Frontend khong can framework.

## 9. Pham vi manifest toi de xuat

### Platform

- `argocd/apps/kube-prometheus-stack.yaml`
- `argocd/apps/argo-rollouts.yaml`

### Backend

- `k8s-api/rollout.yaml`
- `k8s-api/service.yaml`
- `k8s-api/servicemonitor.yaml`
- `k8s-api/analysistemplate.yaml`
- `k8s-api/configmap.yaml` neu can

### Frontend

- `k8s-web/deployment.yaml`
- `k8s-web/service.yaml`
- `k8s-web/configmap.yaml` neu can

### ArgoCD apps

- `argocd/apps/api.yaml`
- `argocd/apps/frontend.yaml`

## 10. Trinh tu lam viec toi de xuat

### Phase 1. Dung nen tang

- them 2 Application cho Prometheus va Argo Rollouts
- push Git
- verify pods len

### Phase 2. Dung backend

- viet Flask app
- build image local
- `minikube image load`
- tao manifest `Rollout + Service + ServiceMonitor`
- push Git
- verify Prometheus scrape duoc

### Phase 3. Dung frontend

- viet static frontend
- build image local
- `minikube image load`
- tao manifest frontend
- push Git
- verify frontend goi duoc backend

### Phase 4. Demo canary

- doi `VERSION v1 -> v2`
- manual promote/abort truoc
- sau do them `AnalysisTemplate`
- doi sang ban loi
- chung minh auto-abort

### Phase 5. Hoan thien slide/demo

- chot 1 kich ban demo ngan:
  - push ban tot -> canary len duoc
  - push ban loi -> canary auto-abort
  - neu can -> `git revert`

## 11. Nhung gi toi se co gang tranh

- khong dua frontend vao React/Vite vi tang so file va thoi gian
- khong canary ca frontend va backend cung luc
- khong thay doi manh vao `k8s/web.yaml` cua bai sang
- khong bat logs/traces neu mentor chua yeu cau, vi se lam phinh scope

## 12. Rui ro can biet truoc

- `kube-prometheus-stack` kha nang, minikube can du RAM/CPU
- neu dung image local, rollout version moi can doi tag ro rang
- query Prometheus cho canary phai dat dung label ngay tu dau
- neu frontend spam request qua manh, local minikube co the cham

## 13. Ghi chu bao mat

File `docker_info.md` dang chua thong tin token Docker Hub rat nhay cam.

Toi khong can dung file nay de lam plan nay.

Toi de xuat:

- khong dua file do vao slide/demo
- khong commit/push lai noi dung token
- doi token neu day la token that dang con hieu luc

## 14. Ket luan

Neu ban dong y huong nay, toi se implement theo huong:

- giu nguyen bai sang
- them 1 app 2 tang rat gon
- canary chi cho backend
- observability xoay quanh metric that cua backend
- toan bo van di qua `root` va GitOps flow san co

Day la huong ngan nhat de bai chieu trong ra "hoan chinh" ma khong bi lam lai tu dau.
