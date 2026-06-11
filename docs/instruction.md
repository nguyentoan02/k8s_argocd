# Plan Thuc Hien Tat Ca Bai Lab Trong `W9-sang-gitops-final.html`

Tai lieu nay tong hop toan bo bai lab trong file HTML thanh mot plan thuc thi de lam lan luot va de review.

## 1. Muc tieu tong the

Sau khi hoan thanh chuoi lab, ban se co:

- 1 cum `minikube` local ten `w9`
- 1 repo GitHub chua manifest Kubernetes va cau hinh ArgoCD
- 1 ung dung `web` duoc ArgoCD quan ly theo GitOps
- kha nang tu dong sync, self-heal, rollback bang Git
- mo hinh `app-of-apps`
- manifest co thu tu sync ro rang bang `sync-wave`
- CI validate manifest tren Pull Request

## 2. Thu tu thuc hien de xuat

Lam theo dung thu tu sau:

1. Lab 0: Dung cum, tao repo, viet app dau tien, push len Git
2. Lab 1: Cai ArgoCD vao cum
3. Lab 2: Tao `Application` de ArgoCD tu sync app
4. Lab 3: Kiem tra cap nhat qua Git va self-heal
5. Lab 4: Rollback bang `git revert`
6. Lab 5: Chuyen sang mo hinh `app-of-apps`
7. Lab 6: Them namespace, configmap, service va ap dung `sync-wave`
8. Lab 7: Them CI validate va branch protection

## 3. Dieu kien tien quyet

Can co san:

- `Docker`
- `kubectl`
- `minikube`
- `git`
- 1 repo GitHub rong, vi du: `gitops`

Gia dinh:

- Ban lam tren may local
- Nhanh gon nhat la dung `minikube` voi driver Docker
- Nhanh gon nhat la dat repo local cung ten `gitops`

## 4. Cau truc repo muc tieu

Sau khi lam xong, repo nen co it nhat cac file/folder sau:

```text
gitops/
  k8s/
    namespace.yaml
    web.yaml
  argocd/
    root.yaml
    apps/
      web.yaml
  .github/
    workflows/
      validate.yml
```

## 5. Plan chi tiet tung lab

### Lab 0. Dung cum + tu viet 1 app + dua len Git

Muc tieu:

- Tao cum local `w9`
- Tao repo local
- Tao manifest app dau tien trong `k8s/web.yaml`
- Push code len GitHub
- Chua apply app len cum

Viec can lam:

1. Khoi tao cum:
   - `minikube start -p w9 --driver=docker`
   - `kubectl config use-context w9`
   - `kubectl get nodes`
2. Tao repo local:
   - tao thu muc `gitops`
   - tao thu muc con `k8s`
3. Tao file `k8s/web.yaml`:
   - `Deployment`
   - app ten `web`
   - namespace `demo`
   - `replicas: 2`
   - image `nginx:1.27`
4. Khoi tao Git:
   - `git init`
   - `git add .`
   - `git commit -m "init"`
   - `git branch -M main`
   - them remote GitHub
   - `git push -u origin main`

Ket qua mong doi:

- Cum `w9` chay binh thuong
- Repo da len GitHub
- Trong repo da co `k8s/web.yaml`
- Chua `kubectl apply` app nay len cum

Checkpoint review:

- `kubectl get nodes` phai thay node `Ready`
- Repo GitHub phai co commit dau tien

### Lab 1. Cai ArgoCD vao cum

Muc tieu:

- Cai ArgoCD trong namespace `argocd`
- Dam bao cac pod ArgoCD da san sang

Viec can lam:

1. Tao namespace:
   - `kubectl create ns argocd`
2. Cai ArgoCD bang manifest chinh thuc:
   - dung `kubectl apply --server-side -n argocd -f <install.yaml>`
3. Cho ArgoCD san sang:
   - `kubectl -n argocd rollout status deploy/argocd-server`
   - `kubectl -n argocd get pods`
4. Tuy chon mo UI de demo:
   - `kubectl -n argocd port-forward svc/argocd-server 8080:443`
   - lay mat khau admin tu `argocd-initial-admin-secret`

Ket qua mong doi:

- Cac pod `argocd-*` o trang thai `Running`
- Co the dang nhap ArgoCD UI neu can

Checkpoint review:

- `kubectl -n argocd get pods` khong con pod loi

### Lab 2. Tao Application de ArgoCD tu sync

Muc tieu:

- Tao file `argocd/apps/web.yaml`
- Khai bao ArgoCD `Application` tro vao repo Git
- ArgoCD tu deploy app `web` vao namespace `demo`

Viec can lam:

1. Tao folder `argocd/apps/`
2. Tao file `argocd/apps/web.yaml`:
   - `kind: Application`
   - `metadata.name: web`
   - `metadata.namespace: argocd`
   - `source.repoURL`: URL repo GitHub cua ban
   - `source.path: k8s`
   - `destination.server: https://kubernetes.default.svc`
   - `destination.namespace: demo`
   - `syncPolicy.automated.prune: true`
   - `syncPolicy.automated.selfHeal: true`
3. Apply Application nay bang tay:
   - `kubectl apply -f argocd/apps/web.yaml`
4. Kiem tra:
   - `kubectl -n argocd get app web`
   - `kubectl -n demo get deploy,pod`

Ket qua mong doi:

- App `web` trong ArgoCD o trang thai `Synced/Healthy`
- Namespace `demo` co `Deployment web` va 2 pod

Checkpoint review:

- Ban chi apply file `Application`
- Manifest app van duoc ArgoCD keo tu Git, khong apply tay

### Lab 3. Doi qua Git va kiem tra self-heal

Muc tieu:

- Chung minh thay doi qua Git se duoc sync vao cum
- Chung minh sua tay tren cum se bi ArgoCD dua ve desired state

Viec can lam:

1. Sua `k8s/web.yaml`:
   - doi `replicas` tu `2` thanh `4`
2. Commit va push:
   - `git commit -am "2->4"`
   - `git push`
3. Cho ArgoCD sync:
   - doi poll hoac bam refresh tren UI
4. Kiem tra self-heal:
   - `kubectl -n demo scale deploy/web --replicas=9`
   - `kubectl -n demo get deploy web -w`

Ket qua mong doi:

- Sau khi push, cum doi thanh 4 replicas
- Sau khi scale tay len 9, ArgoCD tu dua ve 4

Checkpoint review:

- Desired state phai den tu Git
- Sua tay tren cluster khong ton tai lau

### Lab 4. Rollback bang `git revert`

Muc tieu:

- Thuc hien rollback dung cach trong GitOps

Viec can lam:

1. Revert commit moi nhat:
   - `git revert HEAD --no-edit`
   - `git push`
2. Theo doi ArgoCD sync lai cum

Ket qua mong doi:

- Cluster quay ve trang thai truoc commit vua revert

Luu y quan trong:

- Dung `git revert` vi Git la source of truth
- Khong dung `kubectl rollout undo` de rollback trong bai nay, vi ArgoCD se keo cluster lai theo Git neu Git van dang o version moi

Checkpoint review:

- Git log phai the hien ro commit rollback

### Lab 5. Dung mo hinh `app-of-apps`

Muc tieu:

- Tao 1 `root` application quan ly cac application con trong `argocd/apps/`
- Sau buoc nay, viec them app moi chu yeu chi con la them file + push

Viec can lam:

1. Tao file `argocd/root.yaml`:
   - `kind: Application`
   - `metadata.name: root`
   - `metadata.namespace: argocd`
   - `source.repoURL`: URL repo GitHub cua ban
   - `source.path: argocd/apps`
   - `destination.namespace: argocd`
   - bat `automated.prune` va `selfHeal`
2. Commit va push `argocd/root.yaml`
3. Apply `root` bang tay:
   - `kubectl apply -f argocd/root.yaml`
4. Kiem tra:
   - `kubectl -n argocd get applications`

Ket qua mong doi:

- Co `root` va `web` trong ArgoCD
- `root` quan ly cac app con ben trong `argocd/apps/`

Checkpoint review:

- Day la lan cuoi can `kubectl apply` de tao application
- Tu sau buoc nay, them app moi = them file vao `argocd/apps/` + `git push`

### Lab 6. Ep thu tu apply bang `sync-wave`

Muc tieu:

- Dua ca `Namespace`, `ConfigMap`, `Deployment`, `Service` vao Git
- Dam bao ArgoCD apply dung thu tu phu thuoc

Viec can lam:

1. Tao `k8s/namespace.yaml`:
   - `Namespace demo`
   - annotation `argocd.argoproj.io/sync-wave: "-1"`
2. Cap nhat `k8s/web.yaml` thanh nhieu resource:
   - `ConfigMap web-config` voi wave `0`
   - `Deployment web` voi wave `1`
   - `Service web` voi wave `2`
3. Trong `Deployment`:
   - them `envFrom.configMapRef.name: web-config`
4. Commit va push thay doi
5. Quan sat ArgoCD UI hoac sync history

Thu tu mong muon:

1. Namespace `demo`
2. ConfigMap `web-config`
3. Deployment `web`
4. Service `web`

Ket qua mong doi:

- Resource duoc apply dung thu tu
- Deployment khong bi loi do ConfigMap chua ton tai

Checkpoint review:

- Neu bo qua `sync-wave`, co nguy co `CreateContainerConfigError`

### Lab 7. Them CI validate + branch protection

Muc tieu:

- Moi Pull Request thay doi manifest `k8s/**` deu duoc validate schema
- Chan merge neu chua review hoac CI fail

Viec can lam:

1. Tao file `.github/workflows/validate.yml`
2. Cau hinh workflow:
   - trigger tren `pull_request`
   - chi khi thay doi `k8s/**`
   - checkout code
   - cai `kubeconform`
   - chay `kubeconform -strict -summary k8s/`
3. Push workflow len GitHub
4. Tren GitHub, tao branch protection cho `main`:
   - bat `Require a pull request before merging`
   - bat approvals
   - bat `Require status checks to pass`
   - chon check `validate`
5. Test:
   - tao 1 PR co manifest sai schema
   - xac nhan workflow do
   - xac nhan nut Merge bi khoa

Ket qua mong doi:

- PR sai schema khong merge duoc
- PR chua review khong merge duoc

Checkpoint review:

- CI nay chi validate manifest, khong apply len cluster

## 6. Deliverable toi thieu can co sau cung

Ban nen review xem da dat du cac deliverable sau chua:

1. Repo GitHub chua day du `k8s/`, `argocd/`, `.github/workflows/`
2. ArgoCD chay trong cluster `w9`
3. Application `web` Synced/Healthy
4. Self-heal hoat dong
5. Rollback bang `git revert` hoat dong
6. `root` application quan ly `web`
7. `sync-wave` duoc gan dung thu tu
8. Workflow `validate` chay tren PR
9. Branch protection chan merge khi CI fail hoac thieu review

## 7. Thu tu commit de lam cho sach

Neu muon lich su de review dep, nen tach commit theo nhom sau:

1. `init repo with k8s web deployment`
2. `add argocd web application`
3. `scale web from 2 to 4`
4. `revert scale change`
5. `add root app of apps`
6. `add namespace configmap service with sync waves`
7. `add github action validate workflow`

## 8. Rui ro / bay de y khi lam

- Khong apply tay `k8s/web.yaml` o Lab 0, vi Lab 2 moi de ArgoCD keo tu Git
- `repoURL` trong cac file `Application` phai dung chinh xac URL repo GitHub
- Namespace `demo` can duoc quan ly dung cach, dac biet tu Lab 6 tro di
- `kubectl rollout undo` khong phai cach rollback chuan trong flow GitOps nay
- `sync-wave` sai thu tu de gay loi phu thuoc resource
- Workflow CI validate schema, khong thay the review manifest

## 9. Cach review nhanh sau khi xong

Ban co the review theo checklist nay:

1. Repo da co day du file chua?
2. ArgoCD co chay on dinh khong?
3. App `web` co `Synced/Healthy` khong?
4. Push doi replica co tu sync khong?
5. Scale tay co bi self-heal khong?
6. `git revert` co dua cluster ve state cu khong?
7. `root` co quan ly app con khong?
8. `sync-wave` co ap dung dung thu tu khong?
9. PR loi schema co bi chan merge khong?

## 10. Ket luan

Day la chuoi lab xay dung tu co ban den tuong doi day du cho 1 flow GitOps mini:

- Git la source of truth
- ArgoCD la bo reconcile trong cluster
- Rollback phai di qua Git
- Mo rong he thong bang `app-of-apps`
- Bao ve chat luong thay doi bang CI + branch protection
