# Empacker 文档

欢迎使用 Empacker 文档！这里包含了使用 Empacker 构建和打包 JavaScript/TypeScript 项目的完整指南。

## 📚 文档目录

### 🚀 快速开始
- **[使用指南](./Getting-Started.md)** - 完整的入门教程，包含安装、配置和使用示例
- **[CLI 命令](./CLI.md)** - 命令行工具的详细使用说明
- **[配置选项](./Configuration.md)** - 所有配置选项的详细说明和示例

### 🔧 API 参考
- **[API 文档](./API.md)** - 完整的 API 参考，包含所有公开的类、函数和类型定义

## 🎯 快速导航

### 新用户
如果您是第一次使用 Empacker，建议按以下顺序阅读：

1. **[使用指南](./Getting-Started.md)** - 从零开始学习 Empacker
2. **[CLI 命令](./CLI.md)** - 了解命令行工具的使用
3. **[配置选项](./Configuration.md)** - 深入学习配置选项
4. **[API 文档](./API.md)** - 编程式使用 Empacker

### 有经验的用户
如果您已经熟悉 Empacker，可以直接查看：

- **[API 文档](./API.md)** - 查看具体的 API 接口
- **[配置选项](./Configuration.md)** - 查找特定的配置选项
- **[CLI 命令](./CLI.md)** - 查看命令行参数

## 📖 文档特点

### 完整性
- 涵盖从安装到高级用法的所有内容
- 提供丰富的代码示例和配置示例
- 包含常见问题和解决方案

### 实用性
- 基于真实项目场景的示例
- 提供最佳实践和性能优化建议
- 包含故障排除和调试技巧

### 易读性
- 清晰的结构和导航
- 中文文档，易于理解
- 丰富的代码高亮和格式化

## 🛠️ 使用场景

Empacker 适用于以下场景：

### 库开发
- JavaScript/TypeScript 库构建
- React 组件库
- Node.js 模块
- 工具库

### 应用开发
- 浏览器应用
- Node.js 应用
- CLI 工具
- 桌面应用

### 开发工具
- 构建工具
- 开发服务器
- 代码转换工具

## 🎨 特性概览

| 特性 | 描述 | 文档链接 |
|------|------|----------|
| ⚡ 极速构建 | 基于 esbuild，构建速度极快 | [使用指南](./Getting-Started.md) |
| 🔧 TypeScript 支持 | 原生支持 TypeScript，无需额外配置 | [配置选项](./Configuration.md) |
| 📦 多格式输出 | 支持 ESM、CommonJS、IIFE 格式 | [配置选项](./Configuration.md) |
| 🎯 多任务构建 | 支持同时构建多个入口文件 | [API 文档](./API.md) |
| 👀 文件监听 | 开发时自动重新构建 | [CLI 命令](./CLI.md) |
| 📝 类型声明 | 自动生成 TypeScript 声明文件 | [配置选项](./Configuration.md) |
| 🎨 灵活配置 | 支持多种配置文件格式 | [配置选项](./Configuration.md) |
| 🔍 Glob 支持 | 支持 glob 模式匹配入口文件 | [API 文档](./API.md) |

## 📋 快速参考

### 常用命令

```bash
# 安装
pnpm add -D @elecmonkey/empacker

# 初始化配置
empacker init

# 构建项目
empacker build

# 监听模式
empacker watch

# 查看帮助
empacker --help
```

### 基础配置

```javascript
// empacker.config.js
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  minify: true,
  dts: true,
  external: ['react']
};
```

### 编程式使用

```typescript
import { Empacker } from '@elecmonkey/empacker';

const bundler = new Empacker({
  entry: 'src/index.ts',
  outdir: 'dist'
});

const result = await bundler.build();
```

## 🔗 相关链接

- **[GitHub 仓库](https://github.com/elecmonkey/empacker)** - 源代码和问题反馈
- **[npm 包](https://www.npmjs.com/package/@elecmonkey/empacker)** - 包信息和下载
- **[esbuild](https://esbuild.github.io/)** - 底层构建工具文档

## 🤝 贡献

如果您发现文档中的错误或有改进建议，欢迎：

1. 在 GitHub 上提交 Issue
2. 提交 Pull Request
3. 参与社区讨论

## 📄 许可证

Empacker 采用 MIT 许可证，详见 [LICENSE](../LICENSE) 文件。

---

**开始使用 Empacker，享受快速构建的乐趣吧！** 🚀

如果您在使用过程中遇到问题，请查看 [故障排除](./Getting-Started.md#故障排除) 部分或提交 Issue。