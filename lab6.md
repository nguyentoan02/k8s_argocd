# Lab 6

Muc tieu cua Lab 6:

- Dua `Namespace`, `ConfigMap`, `Deployment`, `Service` vao Git
- Ep ArgoCD apply theo dung thu tu bang `sync-wave`
- Hieu cach tranh loi phu thuoc giua cac resource

## Trang thai dau vao

Gia dinh sau Lab 5 ban da co:

- `root` application da ton tai
- `web` application dang duoc quan ly qua `argocd/apps/web.yaml`
- app `web` dang `Synced` va `Healthy`
- file `k8s/web.yaml` hien tai van la `Deployment` don gian

Lab 6 se nang cap manifest hien tai thanh mot bo resource day du hon:

- `Namespace`
- `ConfigMap`
- `Deployment`
- `Service`

## Ket qua can dat sau Lab 6

Sau khi xong, ban phai co:

- file moi `k8s/namespace.yaml`
- file `k8s/web.yaml` duoc doi thanh 3 resource:
  - `ConfigMap`
  - `Deployment`
  - `Service`
- moi resource duoc gan `argocd.argoproj.io/sync-wave`
- ArgoCD apply theo dung thu tu
- app `web` van `Synced` va `Healthy`

## Thu tu apply mong muon

Thu tu can co:

1. `Namespace demo` voi wave `-1`
2. `ConfigMap web-config` voi wave `0`
3. `Deployment web` voi wave `1`
4. `Service web` voi wave `2`

Ly do:

- `Deployment` se doc bien moi truong tu `ConfigMap`
- neu `ConfigMap` chua ton tai ma `Deployment` da chay truoc, pod co the loi

## Buoc 1. Tao file `k8s/namespace.yaml`

Tao file:

```text
k8s/namespace.yaml
```

Noi dung:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: demo
  annotations:
    argocd.argoproj.io/sync-wave: "-1"
```

## Buoc 2. Thay noi dung `k8s/web.yaml`

Thay file cu bang noi dung moi sau:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-config
  namespace: demo
  annotations:
    argocd.argoproj.io/sync-wave: "0"
data:
  MESSAGE: "hello from gitops"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: demo
  annotations:
    argocd.argoproj.io/sync-wave: "1"
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:1.27
          envFrom:
            - configMapRef:
                name: web-config
---
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: demo
  annotations:
    argocd.argoproj.io/sync-wave: "2"
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
```

## Buoc 3. Hieu y nghia cua thay doi

Sau thay doi nay:

- `ConfigMap` duoc tao truoc `Deployment`
- `Deployment` doc bien moi truong tu `web-config`
- `Service` duoc tao sau cung
- `Namespace` duoc tao truoc tat ca resource con lai

Noi dung moi khong chi de app chay, ma de minh hoa cach ArgoCD xu ly phu thuoc resource khi co `sync-wave`.

## Buoc 4. Commit va push

Chay:

```powershell
git add k8s/namespace.yaml k8s/web.yaml
git commit -m "add sync waves for web resources"
git push origin master
```

## Buoc 5. Quan sat ArgoCD sync

Chay:

```powershell
kubectl -n argocd get app web -w
```

Hoac quan sat resource:

```powershell
kubectl -n demo get configmap,deployment,service,pod -w
```

Ban muon thay:

- ArgoCD phat hien commit moi
- sync lai app `web`
- `ConfigMap`, `Deployment`, `Service` duoc cap nhat dung thu tu

Neu dang mo UI ArgoCD, vao app `web` va xem phan sync/resource tree se de quan sat hon.

## Buoc 6. Kiem tra ket qua sau sync

Chay:

```powershell
kubectl get ns demo
kubectl -n demo get configmap
kubectl -n demo get deploy,svc,pod
kubectl -n argocd get app web
```

Ban muon thay:

- namespace `demo` ton tai
- co `ConfigMap web-config`
- co `Deployment web`
- co `Service web`
- app `web` la `Synced` va `Healthy`

## Buoc 7. Kiem tra nhanh `sync-wave`

Neu muon xem annotation da nam dung tren resource chua, chay:

```powershell
kubectl get ns demo -o yaml
kubectl -n demo get configmap web-config -o yaml
kubectl -n demo get deploy web -o yaml
kubectl -n demo get svc web -o yaml
```

Ban muon thay annotation:

- namespace: `-1`
- configmap: `0`
- deployment: `1`
- service: `2`

## Checkpoint Lab 6

Ban xem nhu xong Lab 6 khi:

- repo co them `k8s/namespace.yaml`
- `k8s/web.yaml` da doi sang 3 resource
- tat ca resource duoc apply thanh cong
- app `web` van `Synced/Healthy`
- pod `web` van chay on dinh

## Dieu can hieu sau Lab 6

`sync-wave` dung de:

- ep thu tu apply khi co phu thuoc
- tranh tinh huong resource sau can resource truoc nhung lai bi tao som hon

Trong bai nay, neu bo qua `sync-wave`, nguy co thuong gap la:

- `Deployment` len truoc khi `ConfigMap` co san
- pod loi vi khong doc duoc `configMapRef`

## Neu gap loi

Neu app bi `OutOfSync` hoac `Degraded`, chay:

```powershell
kubectl -n argocd describe app web
```

Neu pod khong len, chay:

```powershell
kubectl -n demo describe pod -l app=web
kubectl -n demo get events --sort-by=.lastTimestamp
```

Neu `Service` khong thay:

- kiem tra file `k8s/web.yaml` da push len remote chua
- kiem tra `root` va `web` app dang doc dung repo/branch chua

## Dau ra nen gui toi de toi review

Sau khi ban lam xong Lab 6, gui lai:

```powershell
kubectl -n argocd get app web
kubectl -n demo get configmap
kubectl -n demo get deploy,svc,pod
git log --oneline -3
```

Va gui them noi dung 2 file:

```text
k8s/namespace.yaml
k8s/web.yaml
```
