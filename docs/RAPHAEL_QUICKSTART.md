# Raphael 水印去除 - 快速开始

## 问题解决

如果遇到"无法上传图片"或模块加载失败的问题，请按以下步骤操作：

### 1. 重新构建项目

```bash
cd C:\ws\gemini-watermark-remover
pnpm build
```

### 2. 启动开发服务器

```bash
pnpm serve
```

或者使用开发模式（自动重新构建）：

```bash
pnpm dev
```

### 3. 访问测试页面

打开浏览器访问：
```
http://localhost:4173/raphael-test.html
```

### 4. 测试功能

1. 点击上传区域或拖拽图片
2. 选择带有 Raphael 水印的图片
3. 等待处理完成
4. 查看处理结果和元数据
5. 下载处理后的图片

## 常见问题

### Q: 页面显示但无法上传图片

**A:** 检查浏览器控制台（F12）是否有错误信息：

- 如果看到 `Failed to load Raphael module`，说明模块未正确构建
- 运行 `pnpm build` 重新构建
- 确保 `dist/raphael-watermark-remover.js` 文件存在

### Q: 模块加载失败 (404 错误)

**A:** 确保：
1. 已运行 `pnpm build`
2. 开发服务器正在运行（`pnpm serve` 或 `pnpm dev`）
3. 访问的是正确的端口（默认 4173）

### Q: 图片处理失败

**A:** 检查：
1. 图片格式是否支持（PNG, JPG, WEBP）
2. 图片是否包含 Raphael 水印
3. 浏览器控制台的详细错误信息

## 技术细节

### 构建系统

项目使用 esbuild 构建，Raphael 模块被打包为独立的 ESM 模块：

- 源文件：`src/core/raphael/`
- 构建输出：`dist/raphael-watermark-remover.js`
- 测试页面：`public/raphael-test.html` → `dist/raphael-test.html`

### 开发模式

开发模式下，文件变化会自动触发重新构建：

```bash
pnpm dev
```

监听的文件：
- `src/core/raphael/**/*.js`
- `public/**/*`

### 生产构建

生产构建会压缩代码：

```bash
pnpm build
```

## 验证安装

运行以下命令验证模块是否正确构建：

```bash
# 检查构建文件
ls -lh dist/raphael-watermark-remover.js

# 检查文件大小（应该约 5-10KB）
# 如果文件不存在或大小为 0，需要重新构建

# 测试服务器访问
curl -I http://localhost:4173/raphael-watermark-remover.js
# 应该返回 200 OK
```

## 下一步

成功运行测试页面后，可以：

1. 查看 API 文档：`src/core/raphael/README.md`
2. 查看使用示例：`examples/raphael-usage-examples.js`
3. 查看集成指南：`docs/RAPHAEL_INTEGRATION.md`

## 需要帮助？

如果问题仍然存在：

1. 检查 Node.js 版本（需要 v18+）
2. 清理并重新安装依赖：
   ```bash
   rm -rf node_modules dist
   pnpm install
   pnpm build
   ```
3. 查看浏览器控制台的完整错误信息
4. 查看终端的构建日志
