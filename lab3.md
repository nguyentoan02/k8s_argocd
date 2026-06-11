# Lab 3

Muc tieu cua Lab 3:

- Thay doi app qua Git
- Xac nhan ArgoCD tu sync cluster theo Git
- Xac nhan `self-heal` hoat dong khi co ai sua tay tren cluster

## Trang thai dau vao

Gia dinh sau Lab 2 ban da co:

- app `web` trong ArgoCD dang `Synced` va `Healthy`
- namespace `demo` da ton tai
- `Deployment web` dang chay 2 pod
- file `argocd/apps/web.yaml` da bat:
  - `automated.prune: true`
  - `automated.selfHeal: true`

Lab 3 khong tao them app moi. Bai nay chi thay doi desired state va quan sat ArgoCD tu dua cluster ve dung theo Git.

## Ket qua can dat sau Lab 3

Sau khi xong, ban phai thay:

- file `k8s/web.yaml` doi `replicas` tu `2` thanh `4`
- thay doi da duoc commit va push len GitHub
- ArgoCD tu sync app `web`
- cluster co `4` pod thay vi `2`
- khi ban scale tay len `9`, ArgoCD tu sua lai ve `4`

## Buoc 1. Xac nhan trang thai truoc khi doi

Chay:

```powershell
kubectl -n argocd get app web
kubectl -n demo get deploy,pod
```

Ban muon thay:

- app `web` van `Synced` va `Healthy`
- `deployment/web` dang chay 2 replica

## Buoc 2. Sua desired state trong Git

Mo file:

```text
k8s/web.yaml
```

Sua:

```yaml
replicas: 2
```

thanh:

```yaml
replicas: 4
```

Sau khi sua, phan lien quan se thanh:

```yaml
spec:
  replicas: 4
```

## Buoc 3. Commit va push thay doi

Chay:

```powershell
git add k8s/web.yaml
git commit -m "scale web from 2 to 4"
git push origin master
```

Neu repo cua ban khong dung nhanh `master` thi doi lai ten nhanh cho dung.

## Buoc 4. Quan sat ArgoCD tu sync

Chay:

```powershell
kubectl -n argocd get app web -w
```

Hoac neu muon xem tren cluster:

```powershell
kubectl -n demo get deploy,pod -w
```

Ban muon thay:

- ArgoCD phat hien repo da doi
- app `web` sync lai
- so pod tang tu 2 len 4

Neu ban dang mo giao dien ArgoCD, co the bam refresh de xem sync nhanh hon.

## Buoc 5. Kiem tra ket qua sau khi sync

Chay:

```powershell
kubectl -n argocd get app web
kubectl -n demo get deploy,pod
```

Ban muon thay:

- app `web` tro lai `Synced` va `Healthy`
- `deployment/web` co `4/4`
- co tong cong 4 pod `web`

## Buoc 6. Test self-heal bang cach sua tay tren cluster

Day la buoc quan trong nhat cua Lab 3.

Chay:

```powershell
kubectl -n demo scale deploy/web --replicas=9
kubectl -n demo get deploy web -w
```

Dieu se xay ra:

- cluster tam thoi doi thanh `9`
- ArgoCD so sanh state thuc te voi Git
- vi Git van ghi `4`, ArgoCD se tu scale ve `4`

## Buoc 7. Kiem tra self-heal da xay ra

Chay:

```powershell
kubectl -n argocd get app web
kubectl -n demo get deploy,pod
```

Ban muon thay:

- app `web` van ve lai `Synced` va `Healthy`
- `deployment/web` quay lai 4 replica
- cluster khong giu thay doi scale tay len 9

## Checkpoint Lab 3

Ban xem nhu xong Lab 3 khi:

- thay doi `replicas: 4` da duoc push len Git
- ArgoCD tu sync cluster thanh 4 replica
- lenh `kubectl scale ... --replicas=9` chi co tac dung tam thoi
- ArgoCD tu dua cluster quay lai 4 replica

## Dieu can hieu sau Lab 3

Day la y nghia thuc te cua GitOps:

- Git moi la source of truth
- cluster chi la noi duoc reconcile theo Git
- sua tay tren cluster khong song sot neu `selfHeal` dang bat

## Neu gap loi

Neu push len Git xong ma ArgoCD khong doi:

- kiem tra repo da push dung branch chua
- kiem tra `repoURL` trong `Application`
- kiem tra app:

```powershell
kubectl -n argocd describe app web
```

Neu scale tay len 9 ma ArgoCD khong dua ve 4:

- kiem tra `selfHeal: true` trong `argocd/apps/web.yaml`
- kiem tra app co dang `OutOfSync` khong:

```powershell
kubectl -n argocd get app web
```

## Dau ra nen gui toi de toi review

Sau khi ban lam xong Lab 3, gui lai:

```powershell
kubectl -n argocd get app web
kubectl -n demo get deploy,pod
git log --oneline -1
```

Va gui them noi dung file:

```text
k8s/web.yaml
```
