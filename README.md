# Puzzel-Lab (听空 ListenCloze)

听空 ListenCloze — 多语种听写填空训练工具

## 功能

1. **PDF 导入** — 支持 PDF/Word/图片导入，自动识别转文字，正字法空格自动修正
2. **德福口语 AI 陪练** — 10 套模拟测试（Modelltest 1-10），每套 7 个任务
3. **德语词典查词** — 1144 条德汉词条，点击生词弹窗显示汉语释义
4. **多语种支持** — 德语、英语、法语等多语种听写训练

## 部署

此项目通过 GitHub Pages 自动部署。
每次推送到 main 分支后，GitHub Actions 会自动构建并发布。

访问地址: https://antongyan0-ui.github.io/Puzzel-Lab/

## 技术特点

- 单文件应用（index.html），所有 CSS/JS 内联
- 外部依赖通过 CDN 加载
- 兼容 GitHub Pages 静态托管
