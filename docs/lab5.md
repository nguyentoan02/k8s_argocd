# Lab 5

Muc tieu cua Lab 5:

- Chuyen sang mo hinh `app-of-apps`
- Tao 1 `root` Application quan ly cac app con trong `argocd/apps/`
- Sau buoc nay, them app moi chu yeu chi can them file vao Git va push

## Trang thai dau vao

Gia dinh sau Lab 4 ban da co:

- ArgoCD dang chay on dinh trong namespace `argocd`
- app `web` dang ton tai va duoc ArgoCD quan ly
- repo da co file:
  - `argocd/apps/web.yaml`
  - `k8s/web.yaml`
- app `web` dang `Synced` va `Healthy`

Hien tai app `web` da ton tai vi ban da apply tay file:

```text
argocd/apps/web.yaml
```

Lab 5 se dua ban sang mo hinh tot hon:

- co 1 app cha ten `root`
- `root` nhin vao folder `argocd/apps/`
- moi file trong do se duoc xem la app con

## Ket qua can dat sau Lab 5

Sau khi xong, ban phai co:

- file `argocd/root.yaml`
- file nay da duoc commit va push len GitHub
- `root` Application ton tai trong namespace `argocd`
- `root` doc folder `argocd/apps/`
- `web` xuat hien nhu mot app con duoc `root` quan ly

## Buoc 1. Xac nhan trang thai truoc khi tao root

Chay:

```powershell
kubectl -n argocd get applications.argoproj.io
git log --oneline -5
```

Ban muon thay:

- app `web` dang ton tai
- repo da o trang thai on dinh sau Lab 4

## Buoc 2. Tao file `argocd/root.yaml`

Tao file:

```text
argocd/root.yaml
```

Noi dung mau:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/<username>/<repo>.git
    path: argocd/apps
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

Voi repo cua ban, `repoURL` se la:

```text
https://github.com/nguyentoan02/k8s_argocd.git
```

## Buoc 3. Hieu dung vai tro cua `root`

File nay co nghia:

- app `root` duoc tao trong namespace `argocd`
- `root` khong deploy app business truc tiep
- `root` doc folder `argocd/apps`
- moi file `Application` trong folder do se tro thanh app con

Trong bai hien tai:

- `web.yaml` la app con dau tien

Sau nay:

- muon them app moi, chi can them them file vao `argocd/apps/` va push Git

## Buoc 4. Commit va push `root.yaml`

Chay:

```powershell
git add argocd/root.yaml
git commit -m "add root app of apps"
git push origin master
```

Neu repo cua ban khong dung nhanh `master` thi doi lai ten nhanh.

## Buoc 5. Apply `root` bang tay mot lan duy nhat

Chay:

```powershell
kubectl apply -f argocd/root.yaml
```

Day la mot moc quan trong:

- o Lab 2, ban apply tay `web` application
- o Lab 5, ban apply tay `root` application
- sau buoc nay, ve nguyen tac, app moi co the duoc tao bang Git thong qua `root`, khong can `kubectl apply` tung app con nua

## Buoc 6. Kiem tra `root` va `web`

Chay:

```powershell
kubectl -n argocd get applications.argoproj.io
kubectl -n argocd get applications.argoproj.io root
kubectl -n argocd get applications.argoproj.io web
```

Ban muon thay:

- co ca `root` va `web`
- `root` sync thanh cong
- `web` van ton tai va hoat dong binh thuong

Neu dang mo UI ArgoCD, ban se thay them app `root`.

## Buoc 7. Hieu ket qua cua Lab 5

Sau Lab 5:

- `root` quan ly folder `argocd/apps`
- `web` la app con nam trong folder do
- sau nay neu them app moi vao `argocd/apps/`, `root` se thay doi va tao app moi theo Git

Dieu nay giup:

- khong can apply tay tung `Application`
- quan ly nhieu app nhat quan hon
- phu hop cach mo rong he thong GitOps

## Checkpoint Lab 5

Ban xem nhu xong Lab 5 khi:

- `argocd/root.yaml` da ton tai
- file da duoc push len GitHub
- `kubectl apply -f argocd/root.yaml` thanh cong
- trong namespace `argocd` co:
  - `root`
  - `web`
- ca hai app deu on dinh

## Luu y quan trong

Lab 5 khong xoa app `web` hien tai.

Muc tieu cua bai la:

- dua vao `root`
- de `root` bat dau quan ly folder app con

Neu sau nay muon chuan hoa ky hon, co the de `root` la diem vao chinh, nhung trong bai hoc nay ban chi can xac nhan `root` da dung va quan ly duoc thu muc `argocd/apps/`.

## Neu gap loi

Neu `root` khong tao duoc:

- kiem tra `repoURL`
- kiem tra `path: argocd/apps`
- kiem tra file `argocd/apps/web.yaml` da co tren remote GitHub

Neu `root` tao roi nhung `web` co van de:

```powershell
kubectl -n argocd describe applications.argoproj.io root
kubectl -n argocd describe applications.argoproj.io web
```

## Dau ra nen gui toi de toi review

Sau khi ban lam xong Lab 5, gui lai:

```powershell
kubectl -n argocd get applications.argoproj.io
kubectl -n argocd get applications.argoproj.io root
kubectl -n argocd get applications.argoproj.io web
git log --oneline -3
```

Va gui them noi dung file:

```text
argocd/root.yaml
```
