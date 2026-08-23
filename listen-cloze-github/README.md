# 听空 ListenCloze - GitHub Pages 部署

## 快速部署

### 方法一：手动上传

1. 在 GitHub 创建新仓库，例如 `listen-cloze`
2. 将本目录所有文件上传到仓库根目录
3. 进入仓库 `Settings → Pages`
4. Source 选择 `Deploy from a branch`
5. Branch 选择 `main`，文件夹选 `/ (root)`
6. 点击 Save，等待 1-2 分钟
7. 访问 `https://你的用户名.github.io/listen-cloze/`

### 方法二：Git 命令推送

```bash
# 初始化仓库
git init
git add .
git commit -m "听空 ListenCloze 最新版本"

# 关联远程仓库（替换为你的地址）
git remote add origin https://github.com/你的用户名/listen-cloze.git
git branch -M main
git push -u origin main
```

推送后在 GitHub 仓库设置中开启 Pages：
`Settings → Pages → Source → Deploy from branch → main → / (root)`

### 方法三：GitHub Actions 自动部署

已包含 `.github/workflows/deploy.yml`，推送代码后自动部署。

需要在仓库设置中开启：
`Settings → Pages → Source → GitHub Actions`

---

## 包含功能

1. **PDF 正字法空格修正** - 导入台识别 PDF 后自动检查并修正德语等语种的单词间距
2. **德福口语 AI 考官陪练** - 10 套模拟测试（Modelltest 1-10），每套 7 个任务
3. **德语词典查词** - 1144 条德汉词条，点击生词弹窗显示汉语释义

## 文件说明

| 文件 | 说明 |
|------|------|
| `index.html` | 完整应用（自包含，无需额外依赖） |
| `.nojekyll` | 禁用 Jekyll 处理，确保直接部署 |
| `.github/workflows/deploy.yml` | GitHub Actions 自动部署配置 |

## 技术特点

- 单文件应用，所有 CSS/JS 内联
- 外部依赖全部通过 CDN 加载
- 兼容 GitHub Pages 静态托管
- 无需后端服务器
