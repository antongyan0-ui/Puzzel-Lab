# 听空 ListenCloze — 部署说明

## 快速部署

```bash
node deploy.js
```

脚本会自动完成登录、部署、验证三个步骤。

## 部署地址

**https://listen-cloze-edit.surge.sh/**

## 账户信息

| 项目 | 值 |
|------|------|
| 邮箱 | `trae-deploy@listen-cloze.app` |
| 密码 | `TraeDeploy2026!` |
| 域名 | `listen-cloze-edit.surge.sh` |
| 项目路径 | `/workspace/listening-cloze-trainer` |

## Token 列表

| Token ID | 用途 | Token 值 |
|----------|------|---------|
| tok-ab60cb94 | 仅限 listen-cloze-edit 部署 | `ab60cb946b2f3e21bb07a9d48a868079` |
| tok-944cfec9 | 账户级别（管理所有域名） | `944cfec92fef02d0b6923a8d7ce8857f` |

## 手动部署方式

### 方式 1: 使用 Token 环境变量（推荐）

```bash
export SURGE_LOGIN="trae-deploy@listen-cloze.app"
export SURGE_TOKEN="ab60cb946b2f3e21bb07a9d48a868079"
surge /workspace/listening-cloze-trainer --domain listen-cloze-edit.surge.sh
```

### 方式 2: 交互式登录

```bash
surge login
# 输入邮箱: trae-deploy@listen-cloze.app
# 输入密码: TraeDeploy2026!
surge /workspace/listening-cloze-trainer --domain listen-cloze-edit.surge.sh
```

### 方式 3: 一键脚本

```bash
node deploy.js
```

## 恢复与故障排除

### Token 失效时

```bash
# 重新登录
surge logout
surge login
# 输入邮箱和密码后重新部署
surge /workspace/listening-cloze-trainer --domain listen-cloze-edit.surge.sh
```

### 创建新 Token

```bash
# 登录后执行
surge tokens add --domain listen-cloze-edit.surge.sh -m "new deploy token"
```

### 查看现有 Token

```bash
surge tokens list
```

### 查看已部署项目

```bash
surge list
```

## 旧域名说明

旧地址 `listen-cloze-2026.surge.sh` 由另一个账户拥有，无法访问。
新地址 `listen-cloze-edit.surge.sh` 为当前有效部署地址。

## 文件清单

| 文件 | 用途 |
|------|------|
| `deploy.js` | 一键部署脚本（自动登录 + 部署 + 验证） |
| `deploy-credentials.json` | 完整凭证备份（JSON 格式，含所有 token） |
| `DEPLOY.md` | 本说明文档 |
| `CNAME` | Surge 自动生成的域名绑定文件 |
