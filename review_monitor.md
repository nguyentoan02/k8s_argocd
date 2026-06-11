# Review monitor app

## 1. Muc tieu cua ban code nay

Ban code nay chua di vao Kubernetes manifest. Muc tieu hien tai la de ban review:

- frontend co du don gian de dung trong lab
- backend co du metric-friendly de gan Prometheus
- contract API ro rang de sau do viet manifest va rollout

## 2. Cau truc moi

```text
app/
  api/
    app.py
    requirements.txt
    Dockerfile
  web/
    index.html
    app.js
    style.css
    nginx.conf
    Dockerfile
```

## 3. Backend review

File chinh: `app/api/app.py`

Backend co 3 endpoint:

- `GET /healthz`
- `GET /api/info`
- `GET /api/config`

Backend tu dong expose:

- `GET /metrics`

qua `prometheus-flask-exporter`.

### Contract `/api/info`

Thanh cong:

```json
{
  "ok": true,
  "app": "demo-api",
  "version": "v1",
  "requestId": "optional-header",
  "responseDelayMs": 0
}
```

That bai do inject:

```json
{
  "ok": false,
  "app": "demo-api",
  "version": "v1",
  "error": "injected failure"
}
```

### Bien moi truong da ho tro

- `APP_NAME`
- `VERSION`
- `ERROR_RATE`
- `RESPONSE_DELAY_MS`

Y nghia:

- `VERSION` de demo canary
- `ERROR_RATE` de tao loi co kiem soat
- `RESPONSE_DELAY_MS` de tao latency neu can test metric

### Diem code toi uu tien

- code ngan, khong framework thua
- tach helper parse env ra rieng
- clamp gia tri `ERROR_RATE` ve `0..1`
- khong dua logic phuc tap vao route

## 4. Frontend review

Frontend la static site, khong can Node build.

File chinh:

- `app/web/index.html`
- `app/web/app.js`
- `app/web/style.css`

### Frontend lam gi

- load cau hinh backend tu `/api/config`
- goi `/api/info`
- hien version, delay, error rate
- dem so request thanh cong / that bai
- co nut `Burst x20` de tao traffic nhanh

### Tai sao chon frontend nay

- du de minh hoa "co FE + BE"
- du de tao traffic cho metric
- khong can React/Vite, tranh tang pham vi bai

## 5. Nginx review

File: `app/web/nginx.conf`

Frontend duoc phuc vu tren port `8080`.
Tat ca request `/api/` duoc proxy sang:

```text
http://demo-api.demo.svc.cluster.local:8080
```

Dieu nay giup:

- frontend khong can hardcode domain ngoai
- khi vao Kubernetes chi can service backend dung ten `demo-api`

## 6. Nhung diem ban nen review ky

### Backend

- ten endpoint co hop voi slide/lab cua ban khong
- muon tra ve JSON dung nhu hien tai hay doi format
- co muon them field timestamp khong

### Frontend

- text/UI co dung gu slide chieu khong
- nut `Burst x20` co du hay muon `x50`
- co muon frontend auto-refresh config khong

### K8s compatibility

- service backend toi dang ngam dinh ten `demo-api`
- namespace toi dang ngam dinh `demo`
- neu ban muon doi naming, nen doi truoc khi toi viet manifest

## 7. Goi y buoc tiep theo sau khi ban duyet

Neu ban ok bo code nay, toi se lam tiep:

1. Viet Docker build command cho 2 image
2. Viet manifest `k8s-api/` va `k8s-web/`
3. Them `Application` vao `argocd/apps/`
4. Them `ServiceMonitor`
5. Them `Rollout` va `AnalysisTemplate`

## 8. Chay local bang Git Bash

Toi da them them:

- `app/web/server.mjs`
- `run-local-api.sh`
- `run-local-web.sh`
- `run-local.md`

Cach chay:

1. Mo terminal Git Bash thu nhat:

```bash
cd /d/Gitops_W9
./run-local-api.sh
```

2. Mo terminal Git Bash thu hai:

```bash
cd /d/Gitops_W9
./run-local-web.sh
```

3. Mo trinh duyet:

```text
http://localhost:8090
```

Frontend local se proxy `/api/*` sang backend local `http://localhost:8080`, nen ban khong can sua JS de test.
De tranh loi loopback/collision tren Windows, local dev mac dinh dung:

- backend: `127.0.0.1:5001`
- frontend: `127.0.0.1:8090`

Ket qua verify local hien tai:

- frontend load duoc config backend
- UI hien `version`, `delay`, `error rate` dung
- local proxy FE -> BE chay on dinh
- co the dung UI nay de review tiep truoc khi viet manifest Kubernetes

## 9. Ghi chu

Toi chu y giu code de doc nhanh trong buoi lab:

- backend 1 file
- frontend 1 page
- khong them dependency thua
- du ngon de review tren man hinh mentor
