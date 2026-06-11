# Lab 2

Muc tieu cua Lab 2:

- Tao `Application` cho ArgoCD
- Cho ArgoCD keo manifest app `web` tu Git
- De ArgoCD tu deploy app `web` vao cluster

## Trang thai dau vao

Gia dinh sau Lab 1 ban da co:

- cluster `minikube` dang chay
- ArgoCD da cai xong trong namespace `argocd`
- ban da vao duoc giao dien ArgoCD
- repo Git da co file `k8s/web.yaml`
- ban chua tung `kubectl apply -f k8s/web.yaml`

Lab 2 bat dau su dung dung tinh than GitOps:

- manifest app nam trong Git
- ArgoCD doc Git va deploy
- ban chi apply file `Application`, khong apply tay manifest app

## Ket qua can dat sau Lab 2

Sau khi xong, ban phai co:

- folder `argocd/apps/`
- file `argocd/apps/web.yaml`
- file nay da duoc commit va push len GitHub
- `Application` ten `web` ton tai trong namespace `argocd`
- app `web` trong ArgoCD o trang thai `Synced/Healthy`
- namespace `demo` co `Deployment web` va pod do ArgoCD tao

## Buoc 1. Xac nhan dau vao truoc khi tao Application

Chay:

```powershell
kubectl config current-context
kubectl -n argocd get pods
git remote -v
```

Ban muon thay:

- context la `minikube`
- ArgoCD pods dang chay
- repo da co remote GitHub dung de ArgoCD doc code

## Buoc 2. Tao cau truc thu muc cho Application

Trong repo, tao thu muc:

```powershell
mkdir argocd
mkdir argocd\apps
```

Sau buoc nay, repo se co them:

```text
argocd/
  apps/
```

## Buoc 3. Tao file `argocd/apps/web.yaml`

Tao file:

```text
argocd/apps/web.yaml
```

Noi dung mau:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: web
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/<username>/<repo>.git
    path: k8s
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: demo
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

Voi repo cua ban, can thay:

```text
https://github.com/<username>/<repo>.git
```

bang URL that su cua repo, vi du:

```text
https://github.com/nguyentoan02/k8s_argocd.git
```

## Buoc 4. Hieu dung y nghia file nay

File `Application` tren co nghia:

- ten app trong ArgoCD la `web`
- ArgoCD doc repo GitHub cua ban
- ArgoCD lay manifest trong folder `k8s`
- ArgoCD deploy vao namespace `demo`
- `prune: true` de xoa tai nguyen khong con trong Git
- `selfHeal: true` de dua cluster ve dung desired state neu ai sua tay

## Buoc 5. Commit va push file Application len Git

Chay:

```powershell
git add argocd/apps/web.yaml
git commit -m "add argocd web application"
git push origin master
```

Neu repo cua ban dang dung nhanh khac `master`, doi lai cho dung.

## Buoc 6. Apply file `Application` bang tay

Day la buoc duy nhat ban duoc apply tay o Lab 2:

```powershell
kubectl apply -f argocd/apps/web.yaml
```

Luu y rat quan trong:

- duoc apply: `argocd/apps/web.yaml`
- khong duoc apply: `k8s/web.yaml`

Ly do:

- `Application` la lenh giao viec cho ArgoCD
- `k8s/web.yaml` phai duoc ArgoCD doc tu Git va deploy

## Buoc 7. Kiem tra ArgoCD da tao app chua

Chay:

```powershell
kubectl -n argocd get applications
kubectl -n argocd get app web
```

Ban muon thay:

- co app `web`
- trang thai dan chuyen sang `Synced` va `Healthy`

Neu ban dang mo UI, ban co the refresh giao dien de xem app `web` xuat hien.

## Buoc 8. Kiem tra deployment duoc tao trong namespace `demo`

Chay:

```powershell
kubectl get ns
kubectl -n demo get deploy,pod
```

Ban muon thay:

- namespace `demo` duoc tao ra trong qua trinh sync
- `Deployment web`
- so pod dung voi `replicas: 2`

Neu namespace `demo` chua duoc tao tu dong trong setup cua ban, ghi lai loi exact message de toi xu ly tiep. Trong mot so setup, ban se can bo sung namespace o lab sau, nhung theo flow bai hoc nay ArgoCD thuong se deploy duoc app nay.

## Checkpoint Lab 2

Ban xem nhu xong Lab 2 khi:

- `argocd/apps/web.yaml` da co trong repo
- file da duoc push len GitHub
- `kubectl apply -f argocd/apps/web.yaml` thanh cong
- app `web` trong ArgoCD la `Synced/Healthy`
- cluster co `Deployment web` trong namespace `demo`

## Viec chua lam o Lab 2

Lab 2 chua bao gom:

- cap nhat app qua Git de tang replica
- test self-heal
- rollback bang `git revert`
- `app-of-apps`

Nhung phan do thuoc Lab 3 tro di.

## Neu gap loi

Neu app `web` khong len `Synced/Healthy`, chay:

```powershell
kubectl -n argocd describe app web
kubectl -n argocd get app web -o yaml
```

Neu loi lien quan den repo:

- kiem tra `repoURL` trong `argocd/apps/web.yaml`
- kiem tra repo la public hay ArgoCD co quyen doc
- kiem tra folder `k8s/` co ton tai tren branch da push

Neu loi lien quan den namespace `demo`:

- paste nguyen van loi khi `kubectl -n argocd describe app web`

## Dau ra nen gui toi de toi review

Sau khi ban lam xong Lab 2, gui lai:

```powershell
kubectl -n argocd get app web
kubectl -n demo get deploy,pod
git log --oneline -1
```

Va gui them noi dung file:

```text
argocd/apps/web.yaml
```

## Review cac buoc da duoc thuc hien tren repo nay

Phan nay ghi lai cac buoc toi da thuc hien de hoan tat Lab 2 tren repo va cluster hien tai.

### Hien trang luc bat dau

- cluster dang o context `minikube`
- ArgoCD trong namespace `argocd` da chay day du
- repo da co `k8s/web.yaml`
- repo remote dang la:
  - `https://github.com/nguyentoan02/k8s_argocd.git`
- chua co thu muc `argocd/apps/`
- chua co `Application` ten `web`

### Cac buoc toi da thuc hien

1. Kiem tra trang thai dau vao:
   - xac nhan ArgoCD pods dang `Running`
   - xac nhan repo remote URL dung de ArgoCD doc Git
2. Tao cau truc file cho Lab 2:
   - tao thu muc `argocd/apps/`
   - tao file `argocd/apps/web.yaml`
3. Cau hinh `Application`:
   - `metadata.name: web`
   - `metadata.namespace: argocd`
   - `spec.project: default`
   - `source.repoURL: https://github.com/nguyentoan02/k8s_argocd.git`
   - `source.path: k8s`
   - `destination.namespace: demo`
   - bat `automated.prune: true`
   - bat `automated.selfHeal: true`
4. Bo sung tinh huong thuc te de Lab 2 chay on dinh:
   - them `syncOptions: CreateNamespace=true`
   - ly do: namespace `demo` chua duoc tao truoc, nen can de ArgoCD co the tao namespace khi sync
5. Nguyen tac duoc giu dung:
   - khong apply `k8s/web.yaml`
   - chi apply `argocd/apps/web.yaml`
6. Khi apply lan dau, ArgoCD bao loi:
   - `The Application "web" is invalid: spec.project: Required value`
   - toi da sua manifest bang cach them `spec.project: default`

### Viec can chay de xac nhan tren cluster

Chay:

```powershell
kubectl apply -f argocd/apps/web.yaml
kubectl -n argocd get app web
kubectl -n demo get deploy,pod
```

Neu moi thu dung, ket qua mong doi la:

- app `web` xuat hien trong ArgoCD
- trang thai dan sang `Synced/Healthy`
- namespace `demo` co `Deployment web`
- co 2 pod `web`

### Ket qua thuc te khi toi chay

Toi da chay:

```powershell
kubectl apply -f argocd/apps/web.yaml
kubectl get applications.argoproj.io -A
kubectl -n demo get deploy,pod
kubectl -n argocd describe applications.argoproj.io web
```

Ket qua nhan duoc:

- `Application web` da duoc tao thanh cong
- ArgoCD da sync thanh cong tu repo:
  - revision `aed936a146ed03a1572154517f4adc4f7b3f18dc`
- namespace `demo` da duoc tao tu dong
- `Deployment web` da duoc tao trong namespace `demo`
- health hien tai la `Progressing`, chua phai `Degraded`

Ly do chua len `Healthy` ngay:

- 2 pod `web` dang o trang thai `ContainerCreating`
- `kubectl describe pod` cho thay kubelet dang `Pulling image "nginx:1.27"`
- day la dau hieu cluster dang keo image, khong phai loi Application

### Ghi chu quan trong

- Trong flow hoc tren slide, Lab 2 nhan manh chi apply tay file `Application`
- Manifest app `k8s/web.yaml` phai do ArgoCD keo tu Git
- Neu repo remote chua co `k8s/web.yaml`, ArgoCD se khong sync duoc. Trong repo nay, file do da ton tai local; can dam bao no da duoc push len remote
