# Lab 7

Muc tieu cua Lab 7:

- Them CI de validate manifest Kubernetes tren Pull Request
- Chan merge neu manifest sai hoac chua dat yeu cau review
- Hoan thien vong doi thay doi theo huong GitOps an toan hon

## Trang thai dau vao

Gia dinh sau Lab 6 ban da co:

- repo Git da co:
  - `k8s/`
  - `argocd/`
- ArgoCD dang dong bo app `web` on dinh
- app `web` dang `Synced` va `Healthy`

Lab 7 khong sua cluster truc tiep. Bai nay tap trung vao:

- validate manifest truoc khi merge
- buoc kiem soat tren GitHub

## Ket qua can dat sau Lab 7

Sau khi xong, ban phai co:

- file `.github/workflows/validate.yml`
- workflow nay chay khi co Pull Request sua `k8s/**`
- workflow validate manifest bang `kubeconform`
- branch `master` hoac `main` duoc bat branch protection
- PR sai schema hoac chua review se khong merge duoc

## Buoc 1. Tao cau truc workflow

Tao folder:

```text
.github/workflows/
```

Tao file:

```text
.github/workflows/validate.yml
```

## Buoc 2. Them noi dung workflow

Noi dung file:

```yaml
name: validate

on:
  pull_request:
    paths:
      - "k8s/**"

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install kubeconform
        run: |
          curl -sSLo kc.tgz https://github.com/yannh/kubeconform/releases/download/v0.6.7/kubeconform-linux-amd64.tar.gz
          tar -xzf kc.tgz
          sudo mv kubeconform /usr/local/bin/

      - name: Validate manifests
        run: kubeconform -strict -summary k8s/
```

## Buoc 3. Hieu workflow nay lam gi

Workflow nay co y nghia:

- chi chay khi co `pull_request`
- chi chay neu PR co thay doi trong `k8s/**`
- checkout code tu PR
- cai `kubeconform`
- validate schema cua manifest trong `k8s/`

No khong:

- apply len cluster
- deploy len ArgoCD
- sua resource trong Kubernetes

No chi kiem tra de chan loi schema truoc khi merge.

## Buoc 4. Commit va push workflow

Chay:

```powershell
git add .github/workflows/validate.yml
git commit -m "add validate workflow"
git push origin master
```

Neu repo cua ban khong dung nhanh `master` thi doi lai ten nhanh.

## Buoc 5. Tao branch moi de test PR

De test workflow dung cach, tao branch rieng:

```powershell
git checkout -b test-validate
```

Sau do sua thu 1 file trong `k8s/` de tao thay doi.

Ban co 2 cach test:

- test pass: sua hop le
- test fail: sua co y sai schema

## Buoc 6. Cach test workflow fail

Vi du sua file `k8s/web.yaml` thanh mot schema sai, roi tao PR.

Muc tieu la:

- workflow `validate` phai do
- GitHub phai hien check fail

Sau khi test xong, ban khong merge branch loi do.

## Buoc 7. Bat branch protection tren GitHub

Tren GitHub:

1. Vao repo
2. Vao `Settings`
3. Vao `Branches`
4. Chon `Add branch protection rule`
5. Chon branch:
   - `master` neu repo dang dung `master`
   - `main` neu repo dang dung `main`

Bat cac tuy chon sau:

- `Require a pull request before merging`
- `Require approvals`
- `Require status checks to pass before merging`

Trong phan status checks, chon:

- `validate`

## Buoc 8. Test branch protection

De xac nhan branch protection dung:

1. Tao 1 PR vao branch chinh
2. Neu PR chua co review, GitHub phai chan merge
3. Neu workflow `validate` fail, GitHub phai chan merge
4. Chi khi:
   - co du review
   - workflow xanh
   thi moi merge duoc

## Checkpoint Lab 7

Ban xem nhu xong Lab 7 khi:

- `.github/workflows/validate.yml` da ton tai
- workflow `validate` chay tren PR co thay doi `k8s/**`
- branch protection da bat
- PR loi schema bi chan merge
- PR chua review bi chan merge

## Dieu can hieu sau Lab 7

Den day flow GitOps cua ban da co du 3 tang:

1. Git la source of truth
2. ArgoCD tu dong sync cluster theo Git
3. GitHub chan thay doi loi truoc khi vao branch chinh

No giup:

- giam loi manifest
- giam merge nham
- co audit trail ro rang qua PR va commit

## Neu gap loi

Neu workflow khong chay:

- kiem tra file nam dung duong dan:
  - `.github/workflows/validate.yml`
- kiem tra PR co thay doi file trong `k8s/**` khong

Neu workflow fail du manifest dung:

- mo tab `Actions` tren GitHub
- xem log job `validate`
- kiem tra manifest co dung schema Kubernetes khong

Neu khong thay check `validate` trong branch protection:

- can dam bao workflow da chay it nhat 1 lan tren repo
- sau do vao lai branch protection de chon check nay

## Dau ra nen gui toi de toi review

Sau khi ban lam xong Lab 7, gui lai:

```powershell
git log --oneline -3
```

Va gui them:

- noi dung file `.github/workflows/validate.yml`
- anh chup hoac mo ta branch protection rule
- ket qua 1 PR test:
  - workflow xanh neu manifest dung
  - workflow do neu manifest sai
