# EcoStep 后台使用说明

## 1) 安装环境
- 安装 Node.js 18+（包含 npm）

## 2) 安装依赖
```bash
npm install
```

## 3) 配置管理员密码与后台路径
复制 `.env.example` 为 `.env`，并修改：
- `ADMIN_PASSWORD`：后台登录密码
- `SESSION_SECRET`：会话签名密钥
- `ADMIN_PATH`：后台地址路径（建议改成你自己知道的随机路径）
- `PORT`：服务端口（默认 3000）

## 4) 启动
```bash
npm start
```

启动后控制台会打印后台完整地址路径。

## 5) 访问地址
- 用户页面：`http://localhost:3000/`
- 管理后台：`http://localhost:3000<你的 ADMIN_PATH>`

## 6) 数据位置
- 家庭编号/激活码/证书鱼数量存储在 `data/family-data.json`
- 正常建议通过后台页面修改

## 7) 重要说明
- 背景鱼数量（`index.html` 里的 `fishCount = 15`）仅视觉效果，与证书鱼数量无关
- 证书鱼数量来自后端数据
- 线上请务必使用 HTTPS，并设置足够强的管理员密码
