# Lab 1

Muc tieu cua Lab 1:

- Cai ArgoCD vao cluster `minikube`
- Dam bao cac thanh phan ArgoCD chay on dinh trong namespace `argocd`
- Tuy chon mo UI ArgoCD de kiem tra

## Trang thai dau vao

Gia dinh sau Lab 0 ban da co:

- cluster `minikube` dang chay
- `kubectl` dang tro dung context
- repo Git da co `k8s/web.yaml`
- ban chua deploy app `web` bang tay

Lab 1 chi tap trung vao viec cai ArgoCD. Chua tao `Application` o buoc nay.

## Ket qua can dat sau Lab 1

Sau khi xong, ban phai co:

- namespace `argocd`
- cac pod `argocd-*` o trang thai `Running`
- co the truy cap UI ArgoCD neu can

## Buoc 1. Xac nhan context truoc khi cai

Chay:

```powershell
kubectl config current-context
kubectl get nodes
```

Ban muon thay:

- context la `minikube`
- node o trang thai `Ready`

Neu context sai, chay:

```powershell
kubectl config use-context minikube
```

## Buoc 2. Tao namespace `argocd`

Chay:

```powershell
kubectl create namespace argocd
```

Neu namespace da ton tai, ban co the bo qua loi `AlreadyExists`.

## Buoc 3. Cai ArgoCD bang manifest chinh thuc

Chay:

```powershell
kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Tai sao dung `--server-side`:

- bo manifest cai dat ArgoCD co nhieu CRD lon
- cach nay tranh loi annotation qua dai

## Buoc 4. Cho ArgoCD len day du

Chay:

```powershell
kubectl -n argocd rollout status deploy/argocd-server
kubectl -n argocd get pods
```

Neu muon xem chi tiet hon, chay them:

```powershell
kubectl -n argocd get all
```

Ban muon thay:

- `argocd-server` rollout thanh cong
- cac pod nhu `argocd-server`, `argocd-repo-server`, `argocd-application-controller`, `argocd-dex-server`, `argocd-redis` o trang thai `Running` hoac `Completed` neu la job

## Buoc 5. Mo UI ArgoCD de demo

Neu muon vao giao dien web, mo port-forward:

```powershell
kubectl -n argocd port-forward svc/argocd-server 8080:443
```

Sau do truy cap:

```text
https://localhost:8080
```

Username mac dinh:

```text
admin
```

Lay mat khau ban dau:

```powershell
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}"
```

Neu output dang base64, giai ma:

```powershell
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String((kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}")))
```

Luu y:

- tren mot so ban cai, `jsonpath` co the tra ve chuoi da ma hoa base64
- tren PowerShell, cach giai ma tren la on dinh hon `base64 -d`

## Buoc 6. Kiem tra namespace va tai nguyen

Chay:

```powershell
kubectl get ns
kubectl -n argocd get pods
kubectl -n argocd get svc
```

Can xac nhan:

- namespace `argocd` da ton tai
- service `argocd-server` da ton tai
- cac pod can thiet da chay

## Checkpoint Lab 1

Ban xem nhu xong Lab 1 khi:

- `argocd` namespace da duoc tao
- ArgoCD da cai xong
- `kubectl -n argocd get pods` cho thay cac pod chinh o trang thai `Running`
- ban co the vao UI neu can

## Viec chua lam o Lab 1

Lab 1 chua bao gom:

- tao `Application`
- deploy app `web` qua ArgoCD
- sync tu Git

Nhung viec do thuoc Lab 2.

## Neu gap loi

Neu `kubectl apply` loi do mang:

- kiem tra may co internet
- kiem tra co bi chan truy cap `raw.githubusercontent.com` khong

Neu pod ArgoCD khong len:

- chay `kubectl -n argocd get pods`
- chay `kubectl -n argocd describe pod <ten-pod>`
- chay `kubectl -n argocd logs <ten-pod>`

Neu khong vao duoc UI:

- kiem tra lenh `port-forward` con dang chay
- dung dung URL `https://localhost:8080`
- chap nhan canh bao certificate self-signed

## Dau ra nen gui toi de toi review

Sau khi ban lam xong Lab 1, gui lai:

```powershell
kubectl config current-context
kubectl -n argocd get pods
kubectl -n argocd get svc
```

Neu ban mo UI, gui them:

```powershell
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}"
```
