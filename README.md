# 图片压缩工具

这是一个简单易用的在线图片压缩工具，采用现代化的苹果风格设计，帮助用户快速压缩图片文件大小。无需安装任何软件，打开网页即可使用。

## 功能特点

### 1. 图片上传
- ✨ 支持 PNG、JPG 等常见图片格式
- 🖱️ 支持拖拽上传和点击上传
- 🎯 智能文件类型检测
- 🖼️ 实时预览上传的图片

### 2. 图片压缩
- 🎚️ 可调节压缩比例（0-100%）
- 👀 实时预览压缩效果
- 📊 显示压缩前后的文件大小对比
- 💫 保持原始图片宽高比
- 🎨 无损压缩模式（当质量设置为 100%）

### 3. 图片下载
- ⚡ 一键下载压缩后的图片
- 📝 智能文件命名
- 🎯 保持原始图片格式
- 💾 本地即时保存

## 使用说明

1. 上传图片
   - 方式一：点击上传区域，从文件管理器选择图片
   - 方式二：直接将图片拖拽到上传区域

2. 调整压缩设置
   - 使用滑块调节压缩质量（0-100%）
   - 实时查看压缩效果
   - 对比压缩前后的文件大小

3. 下载图片
   - 确认压缩效果后，点击"下载压缩后的图片"按钮
   - 图片将自动下载到本地

## 技术实现

### 前端技术
- 📱 响应式设计：适配各种设备屏幕
- 🎨 现代化 UI：采用苹果风格设计
- 📦 轻量级：无需任何外部依赖

### 核心技术
- HTML5
  - 语义化标签结构
  - File API 处理文件上传
  - Canvas API 实现图片压缩
  
- CSS3
  - Flexbox 和 Grid 布局
  - 变量管理主题色彩
  - 渐变和阴影效果
  - 平滑过渡动画
  
- JavaScript
  - 原生 JS 实现所有功能
  - FileReader API 读取文件
  - Canvas API 处理图片
  - Blob API 处理二进制数据

## 项目结构

```
.
├── index.html          # 主页面
├── css/
│   └── style.css      # 样式文件
└── js/
    └── main.js        # 主要功能实现
```

## 浏览器兼容性

- ✅ Chrome 最新版
- ✅ Firefox 最新版
- ✅ Safari 最新版
- ✅ Edge 最新版

## 性能优化

- 🚀 本地压缩，无需服务器
- 📦 小型文件秒传秒压
- 🔄 实时预览无卡顿
- 💾 压缩后立即下载

## 未来计划

- [ ] 添加批量压缩功能
- [ ] 支持更多图片格式（WebP、AVIF）
- [ ] 添加自定义压缩尺寸
- [ ] 添加暗色主题
- [ ] 支持图片编辑功能

## 开发者

本项目由经验丰富的前端工程师开发，采用最新的 Web 技术，为用户提供最佳的图片压缩体验。如果您在使用过程中遇到任何问题，欢迎反馈。 