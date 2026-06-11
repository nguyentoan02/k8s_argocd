# Lab 4

Muc tieu cua Lab 4:

- Rollback app bang Git
- Xac nhan ArgoCD tu sync cluster ve trang thai cu
- Hieu vi sao trong GitOps phai rollback bang `git revert`

## Trang thai dau vao

Gia dinh sau Lab 3 ban da co:

- app `web` trong ArgoCD dang `Synced` va `Healthy`
- `k8s/web.yaml` da doi `replicas` tu `2` thanh `4`
- thay doi do da duoc commit va push len Git
- cluster hien dang chay `4` replica

Lab 4 se dua app quay ve state truoc do, tuc la quay lai `2` replica.

## Ket qua can dat sau Lab 4

Sau khi xong, ban phai thay:

- Git co them 1 commit rollback
- commit tang replica bi revert
- ArgoCD tu sync lai cluster
- `deployment/web` quay tu `4` ve `2`
- app `web` van `Synced` va `Healthy`

## Buoc 1. Xac nhan commit gan nhat

Chay:

```powershell
git log --oneline -3
```

Ban muon thay commit tang replica o gan dau lich su, vi du commit kieu:

```text
scale web from 2 to 4
```

Luu y:

- Khong mac dinh revert `HEAD`
- Ban phai revert dung commit da doi replica
- Neu sau Lab 3 ban con commit them file huong dan nhu `lab3.md`, thi commit doi replica co the nam o giua lich su, khong nam o dau

## Buoc 2. Revert dung commit doi replica

Chay:

```powershell
git revert <commit-doi-replica> --no-edit
```

Voi repo cua ban trong luc review, commit dung can revert la:

```powershell
git revert 82ba8c8 --no-edit
```

Lenh nay se:

- tao mot commit moi
- noi rang thay doi truoc do bi dao nguoc
- khong xoa lich su Git

## Buoc 3. Push commit revert len GitHub

Chay:

```powershell
git push origin master
```

Neu repo cua ban khong dung nhanh `master` thi doi lai ten nhanh cho dung.

## Buoc 4. Quan sat ArgoCD tu sync rollback

Chay:

```powershell
kubectl -n argocd get app web -w
```

Hoac quan sat tren deployment:

```powershell
kubectl -n demo get deploy,pod -w
```

Ban muon thay:

- ArgoCD phat hien commit moi tren Git
- cluster duoc reconcile lai theo state da revert
- so pod giam tu `4` ve `2`

## Buoc 5. Kiem tra ket qua sau rollback

Chay:

```powershell
kubectl -n argocd get app web
kubectl -n demo get deploy,pod
git log --oneline -3
```

Ban muon thay:

- app `web` la `Synced` va `Healthy`
- `deployment/web` con `2` replica
- Git co them 1 commit revert

Voi repo cua ban, mot ket qua hop ly sau khi xong se co dang:

```text
Revert "scale web from 2 to 4"
```

## Checkpoint Lab 4

Ban xem nhu xong Lab 4 khi:

- cluster quay ve `2` replica
- app van `Synced/Healthy`
- lich su Git co commit revert ro rang

## Dieu can hieu sau Lab 4

Trong GitOps:

- Git la source of truth
- rollback dung cach la sua Git
- ArgoCD chi lam nhiem vu dong bo cluster theo Git

Vi vay:

- dung: `git revert`
- khong dung: `kubectl rollout undo`

Neu ban dung `kubectl rollout undo`:

- cluster co the tam thoi quay ve ban cu
- nhung Git van ghi state moi
- ArgoCD se lai keo cluster ve state moi

Do do rollback bang `kubectl` trong bai nay la rollback gia.

## Neu gap loi

Neu `git revert` bao conflict:

- dung `git status` de xem file nao dang conflict
- giai quyet conflict
- chay:

```powershell
git add .
git revert --continue
```

Neu push xong ma ArgoCD khong sync:

- kiem tra app:

```powershell
kubectl -n argocd describe app web
```

- kiem tra repo da push dung branch chua

## Dau ra nen gui toi de toi review

Sau khi ban lam xong Lab 4, gui lai:

```powershell
kubectl -n argocd get app web
kubectl -n demo get deploy,pod
git log --oneline -3
```
