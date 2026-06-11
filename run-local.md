# Chay local voi Git Bash

## Muc tieu

Chay duoc:

- backend local bang Python
- frontend local bang Node
- frontend proxy `/api/*` sang backend

Khong can Docker cho buoc review nay.

## 1. Chay backend

Mo Git Bash:

```bash
cd /d/Gitops_W9
./run-local-api.sh
```

Mac dinh backend se chay:

```text
http://localhost:5001
```

Co the doi bien moi truong truoc khi chay:

```bash
export VERSION=v2
export ERROR_RATE=0.3
export RESPONSE_DELAY_MS=250
export PORT=5001
./run-local-api.sh
```

## 2. Chay frontend

Mo Git Bash khac:

```bash
cd /d/Gitops_W9
./run-local-web.sh
```

Mac dinh frontend se chay:

```text
http://localhost:8090
```

Mac dinh frontend proxy API toi:

```text
http://127.0.0.1:5001
```

## 3. Link de test

Backend:

- `http://localhost:5001/healthz`
- `http://localhost:5001/api/config`
- `http://localhost:5001/api/info`
- `http://localhost:5001/metrics`

Frontend:

- `http://localhost:8090`

## 4. Luu y

- Phai mo 2 terminal:
  - 1 terminal cho backend
  - 1 terminal cho frontend
- Frontend local da tu proxy `/api/*` sang backend local, nen UI se chay duoc ngay.
