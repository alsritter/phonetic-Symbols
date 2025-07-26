Fork from [here](https://github.com/zhen-ke/phonetic-Symbols)

简单修改，提高了播放速度，添加音频缓存

## 自动部署到 Vercel

本项目配置了 GitHub Action 自动部署到 Vercel。

### 配置步骤

1. 在 Vercel 中创建项目并获取以下信息：
   - Vercel Token (从 https://vercel.com/account/tokens 获取)
   - Organization ID
   - Project ID

2. 在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下密钥：
   - `VERCEL_TOKEN`: 你的 Vercel Token
   - `ORG_ID`: 你的 Vercel Organization ID
   - `PROJECT_ID`: 你的 Vercel Project ID

3. 推送代码到 main 分支后，GitHub Action 会自动触发部署

### 获取 Organization ID 和 Project ID

运行以下命令获取：
```bash
npx vercel link
```

然后查看 `.vercel/project.json` 文件获取相关 ID。


