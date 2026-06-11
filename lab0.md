# Lab 0

Muc tieu cua Lab 0:

- Xac nhan cluster dang dung duoc
- Tao repo local cho bai GitOps
- Tao manifest app dau tien `k8s/web.yaml`
- Day repo len GitHub
- Khong apply app len cluster o buoc nay

## Trang thai hien tai

Ban da co:

- `minikube` dang chay
- `kubectl get nodes` tra ve node `Ready`

Nghia la phan dung cluster co the xem la da xong. Lab 0 cua ban nen tap trung vao repo va manifest.

## Ket qua can dat sau Lab 0

Sau khi xong, ban phai co:

- 1 thu muc repo local, vi du `gitops`
- 1 file `k8s/web.yaml`
- code da duoc push len repo GitHub
- chua `kubectl apply -f k8s/web.yaml`

## Buoc 1. Xac nhan dung context Kubernetes

Chay:

```powershell
kubectl config current-context
kubectl get nodes
```

Ban muon thay:

- context dang tro vao `minikube`
- node o trang thai `Ready`

Neu current context khong phai `minikube`, chay:

```powershell
kubectl config use-context minikube
```

## Buoc 2. Tao thu muc lam viec cho repo

Vi du tao repo local tai:

```powershell
cd D:\
mkdir gitops
cd .\gitops
mkdir k8s
```

Sau buoc nay, cau truc toi thieu se la:

```text
gitops/
  k8s/
```

## Buoc 3. Tao file `k8s/web.yaml`

Tao file `k8s/web.yaml` voi noi dung:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: demo
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
```

Giai thich ngan:

- day la `Deployment` ten `web`
- se chay 2 replica
- dung image `nginx:1.27`
- namespace muc tieu la `demo`

Luu y:

- Chua can tao namespace `demo` o Lab 0
- Chua can apply file nay len cluster

## Buoc 4. Khoi tao Git local

Trong thu muc repo `gitops`, chay:

```powershell
git init
git add .
git commit -m "init"
git branch -M main
```

Sau buoc nay, repo local da co commit dau tien.

## Buoc 5. Tao repo GitHub rong

Tren GitHub, tao 1 repo moi rong, vi du:

- ten repo: `gitops`
- khong can them `README`, `.gitignore`, hoac license neu muon push repo local len truc tiep

Sau khi tao xong, lay URL repo. Vi du:

```text
https://github.com/<username>/gitops.git
```

## Buoc 6. Noi repo local voi GitHub va push

Chay:

```powershell
git remote add origin https://github.com/<username>/gitops.git
git push -u origin main
```

Neu ban dung GitHub HTTPS, co the se can dang nhap hoac dung token.

## Buoc 7. Kiem tra ket qua

Can kiem tra 3 diem:

1. Local co file `k8s/web.yaml`
2. GitHub da nhan commit `init`
3. Ban chua tung chay:

```powershell
kubectl apply -f k8s/web.yaml
```

## Checkpoint Lab 0

Ban xem nhu xong Lab 0 khi:

- `kubectl get nodes` van `Ready`
- repo GitHub da co code
- file `k8s/web.yaml` da ton tai
- app `web` chua duoc deploy bang tay

## Tai sao khong apply o Lab 0

Vi o Lab 2, ban se tao `Application` de ArgoCD tu keo manifest tu Git va deploy vao cluster.

Neu ban apply tay ngay o Lab 0, ban se bo lo y chinh cua bai la:

- Git la source of truth
- ArgoCD moi la thanh phan deploy app

## Neu gap loi

Neu `git push` loi:

- kiem tra repo GitHub da tao rong chua
- kiem tra URL remote dung chua
- kiem tra quyen dang nhap GitHub

Neu `kubectl config current-context` khong phai `minikube`:

- chay `kubectl config use-context minikube`

## Dau ra nen gui toi de toi review

Sau khi ban lam xong Lab 0, gui lai:

```powershell
kubectl config current-context
git remote -v
git log --oneline -1
```

Va chup hoac paste noi dung file:

```text
k8s/web.yaml
```

## Review cac buoc da duoc thuc hien tren repo nay

Phan nay ghi lai cac buoc toi da thuc hien de hoan tat phan con lai cua Lab 0 tren repo hien tai.

### Hien trang luc bat dau

- Cluster da san sang voi context `minikube`
- `kubectl get nodes` truoc do da ra node `Ready`
- Repo Git da ton tai va da co remote:
  - `https://github.com/nguyentoan02/k8s_argocd.git`
- Repo dang o nhanh `master`
- Commit gan nhat luc kiem tra la:
  - `1776fda first commit`
- Tren repo da co san:
  - `W9-sang-gitops-final.html`
  - `instruction.md`
- Chua co thu muc `k8s/` va chua co file `k8s/web.yaml`

### Cac buoc toi da thuc hien

1. Kiem tra context Kubernetes:
   - da xac nhan `kubectl config current-context` = `minikube`
2. Kiem tra Git:
   - da xac nhan repo co `origin`
   - da xac nhan nhanh hien tai la `master`
   - da xac nhan commit hien co la `first commit`
3. Tao deliverable con thieu cua Lab 0:
   - tao thu muc `k8s/`
   - tao file `k8s/web.yaml`
4. Noi dung file `k8s/web.yaml` da duoc them theo yeu cau bai:
   - `Deployment`
   - ten app `web`
   - namespace `demo`
   - `replicas: 2`
   - image `nginx:1.27`
5. Khong deploy bang tay:
   - toi khong chay `kubectl apply -f k8s/web.yaml`
   - ly do: Lab 0 yeu cau chua apply, de Lab 2 cho ArgoCD deploy tu Git

### Viec tiep theo de dong Lab 0

De Lab 0 hoan tat tren remote repo, can them:

```powershell
git add k8s/web.yaml lab0.md
git commit -m "add lab0 deployment manifest"
git push origin master
```

### Tieu chi xac nhan da xong Lab 0

Ban co the xem la xong khi:

- repo local co `k8s/web.yaml`
- remote GitHub co commit chua file nay
- cluster van o context `minikube`
- ban chua apply tay manifest len cluster
