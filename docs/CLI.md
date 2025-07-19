# Empacker CLI 文档

## 概述

Empacker 提供了命令行界面 (CLI) 工具，让您可以通过命令行快速构建和打包项目。

## 安装

### 全局安装

```bash
# 使用 pnpm
pnpm add -g @elecmonkey/empacker

# 使用 npm
npm install -g @elecmonkey/empacker

# 使用 yarn
yarn global add @elecmonkey/empacker
```

### 本地安装

```bash
# 使用 pnpm
pnpm add -D @elecmonkey/empacker

# 使用 npm
npm install -D @elecmonkey/empacker

# 使用 yarn
yarn add -D @elecmonkey/empacker
```

## 基本用法

```bash
# 查看帮助信息
empacker --help

# 查看版本信息
empacker --version
```

## 命令列表

### `empacker build`

构建项目，将源代码打包成可执行的文件。

#### 语法

```bash
empacker build [options]
```

#### 选项

| 选项 | 简写 | 类型 | 默认值 | 描述 |
|------|------|------|--------|------|
| `--config` | `-c` | `string` | - | 配置文件路径 |
| `--entry` | `-e` | `string` | - | 入口文件 |
| `--outdir` | `-o` | `string` | `dist` | 输出目录 |
| `--outfile` | - | `string` | - | 输出文件名 |
| `--format` | `-f` | `cjs\|esm\|iife` | `esm` | 输出格式 |
| `--bundle` | - | `boolean` | `true` | 打包成单个文件 |
| `--no-bundle` | - | `boolean` | - | 不打包，保持文件结构 |
| `--sourcemap` | - | `boolean` | `false` | 生成 source map |
| `--no-sourcemap` | - | `boolean` | - | 不生成 source map |
| `--minify` | - | `boolean` | `true` | 压缩代码 |
| `--no-minify` | - | `boolean` | - | 不压缩代码 |
| `--dts` | - | `boolean` | `false` | 生成 TypeScript 声明文件 |
| `--external` | - | `string...` | `[]` | 外部依赖 |

#### 使用示例

**基础构建：**
```bash
# 使用配置文件构建
empacker build

# 指定入口文件构建
empacker build -e src/index.ts

# 指定输出目录
empacker build -e src/index.ts -o dist
```

**指定输出格式：**
```bash
# 输出 CommonJS 格式
empacker build -e src/index.ts -f cjs

# 输出 ESM 格式
empacker build -e src/index.ts -f esm

# 输出 IIFE 格式
empacker build -e src/index.ts -f iife
```

**控制打包行为：**
```bash
# 打包成单个文件（默认）
empacker build -e src/index.ts --bundle

# 不打包，保持文件结构
empacker build -e src/index.ts --no-bundle

# 生成 source map
empacker build -e src/index.ts --sourcemap

# 不压缩代码
empacker build -e src/index.ts --no-minify
```

**生成声明文件：**
```bash
# 生成 TypeScript 声明文件
empacker build -e src/index.ts --dts
```

**指定外部依赖：**
```bash
# 排除 React 和 React-DOM
empacker build -e src/index.ts --external react react-dom

# 排除多个依赖
empacker build -e src/index.ts --external react react-dom lodash
```

**使用自定义配置文件：**
```bash
# 指定配置文件路径
empacker build -c ./custom.config.js

# 使用 TypeScript 配置文件
empacker build -c ./empacker.config.ts
```

**完整示例：**
```bash
empacker build \
  -e src/index.ts \
  -o dist \
  -f esm \
  --bundle \
  --minify \
  --sourcemap \
  --dts \
  --external react react-dom
```

### `empacker watch`

监听文件变化并自动重新构建。

#### 语法

```bash
empacker watch [options]
```

#### 选项

与 `empacker build` 命令的选项完全相同。

#### 使用示例

**基础监听：**
```bash
# 使用配置文件监听
empacker watch

# 指定入口文件监听
empacker watch -e src/index.ts
```

**监听并生成 source map：**
```bash
empacker watch -e src/index.ts --sourcemap
```

**监听并排除外部依赖：**
```bash
empacker watch -e src/index.ts --external react
```

**完整监听示例：**
```bash
empacker watch \
  -e src/index.ts \
  -o dist \
  -f esm \
  --bundle \
  --minify \
  --sourcemap \
  --external react
```

**停止监听：**
按 `Ctrl+C` 停止监听模式。

### `empacker init`

创建默认的配置文件。

#### 语法

```bash
empacker init [options]
```

#### 选项

| 选项 | 简写 | 类型 | 默认值 | 描述 |
|------|------|------|--------|------|
| `--format` | `-f` | `js\|ts\|json` | `js` | 配置文件格式 |

#### 使用示例

**创建 JavaScript 配置文件：**
```bash
empacker init
# 或
empacker init -f js
```

**创建 TypeScript 配置文件：**
```bash
empacker init -f ts
```

**创建 JSON 配置文件：**
```bash
empacker init -f json
```

## 配置文件

Empacker 支持多种配置文件格式，按优先级自动查找：

1. `empacker.config.js`
2. `empacker.config.ts`
3. `empacker.config.mjs`
4. `empacker.config.json`

### JavaScript 配置文件示例

```javascript
// empacker.config.js
export default {
  // 单任务配置
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  sourcemap: false,
  minify: true,
  dts: false,
  external: ['esbuild'],
  
  // 多任务配置
  tasks: [
    {
      name: 'main',
      entry: 'src/index.ts',
      outdir: 'dist',
      format: 'esm',
      bundle: true,
      minify: true,
      external: ['esbuild']
    },
    {
      name: 'cli',
      entry: 'src/cli.ts',
      outfile: 'dist/cli.cjs',
      format: 'cjs',
      bundle: true,
      minify: true,
      external: ['esbuild']
    }
  ]
};
```

### TypeScript 配置文件示例

```typescript
// empacker.config.ts
import { EmpackerConfig } from '@elecmonkey/empacker';

const config: EmpackerConfig = {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  sourcemap: false,
  minify: true,
  dts: false,
  external: ['esbuild'],
  
  tasks: [
    {
      name: 'main',
      entry: 'src/index.ts',
      outdir: 'dist',
      format: 'esm',
      bundle: true,
      minify: true,
      external: ['esbuild']
    },
    {
      name: 'cli',
      entry: 'src/cli.ts',
      outfile: 'dist/cli.cjs',
      format: 'cjs',
      bundle: true,
      minify: true,
      external: ['esbuild']
    }
  ]
};

export default config;
```

### JSON 配置文件示例

```json
{
  "entry": "src/index.ts",
  "outdir": "dist",
  "format": "esm",
  "bundle": true,
  "sourcemap": false,
  "minify": true,
  "dts": false,
  "external": ["esbuild"],
  "tasks": [
    {
      "name": "main",
      "entry": "src/index.ts",
      "outdir": "dist",
      "format": "esm",
      "bundle": true,
      "minify": true,
      "external": ["esbuild"]
    },
    {
      "name": "cli",
      "entry": "src/cli.ts",
      "outfile": "dist/cli.cjs",
      "format": "cjs",
      "bundle": true,
      "minify": true,
      "external": ["esbuild"]
    }
  ]
}
```

## 命令行参数与配置文件

命令行参数会覆盖配置文件中的相应选项：

```bash
# 配置文件指定 format: 'esm'，但命令行覆盖为 'cjs'
empacker build -f cjs
```

## 常见使用场景

### 1. 快速开始

```bash
# 1. 初始化配置文件
empacker init

# 2. 编辑配置文件（根据需要修改）

# 3. 构建项目
empacker build

# 4. 开发时使用监听模式
empacker watch
```

### 2. 构建库项目

```bash
# 构建 ESM 格式的库
empacker build -e src/index.ts -f esm --bundle --minify --dts

# 构建 CommonJS 格式的库
empacker build -e src/index.ts -f cjs --bundle --minify --dts
```

### 3. 构建应用

```bash
# 构建单页应用
empacker build -e src/main.ts -f iife --bundle --minify

# 构建 Node.js 应用
empacker build -e src/cli.ts -f cjs --bundle --minify
```

### 4. 多入口构建

```bash
# 使用配置文件定义多个入口
empacker build

# 或使用 glob 模式
empacker build -e "src/**/*.ts" --no-bundle
```

### 5. 开发环境

```bash
# 开发时使用监听模式，生成 source map
empacker watch --sourcemap --no-minify

# 生产构建
empacker build --minify --no-sourcemap
```

## 错误处理

### 常见错误及解决方案

**1. 找不到配置文件**
```
❌ 没有找到配置文件，且未指定入口文件
💡 请使用 empacker init 创建配置文件，或使用 -e 参数指定入口文件
```

**解决方案：**
```bash
# 创建配置文件
empacker init

# 或直接指定入口文件
empacker build -e src/index.ts
```

**2. 入口文件不存在**
```
❌ 构建失败:
   入口文件不存在: src/index.ts
```

**解决方案：**
- 检查文件路径是否正确
- 确保文件确实存在
- 使用绝对路径或相对路径

**3. 监听模式不支持多任务**
```
❌ 监听模式暂不支持多任务配置
```

**解决方案：**
- 使用单任务配置
- 或分别监听每个任务

**4. TypeScript 编译错误**
```
❌ 构建失败:
   src/index.ts:10:5 - error TS2307: Cannot find module 'react'
```

**解决方案：**
- 安装缺失的依赖
- 将依赖添加到 `external` 选项中
- 检查 TypeScript 配置

## 性能优化建议

### 1. 合理使用外部依赖

```bash
# 将大型库设为外部依赖，避免打包
empacker build -e src/index.ts --external react react-dom lodash
```

### 2. 选择合适的打包策略

```bash
# 库项目：保持文件结构，便于 tree-shaking
empacker build -e src/index.ts --no-bundle

# 应用项目：打包成单个文件，减少请求
empacker build -e src/main.ts --bundle
```

### 3. 开发环境优化

```bash
# 开发时禁用压缩，启用 source map
empacker watch --no-minify --sourcemap

# 生产环境启用压缩，禁用 source map
empacker build --minify --no-sourcemap
```

## 与其他工具集成

### 与 package.json 集成

```json
{
  "scripts": {
    "build": "empacker build",
    "build:watch": "empacker watch",
    "build:prod": "empacker build --minify --no-sourcemap",
    "build:dev": "empacker build --sourcemap --no-minify"
  }
}
```

### 与 CI/CD 集成

```yaml
# GitHub Actions 示例
- name: Build project
  run: |
    npm install
    npm run build
```

### 与编辑器集成

在 VS Code 中，可以配置任务：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Build",
      "type": "shell",
      "command": "empacker",
      "args": ["build"],
      "group": "build"
    },
    {
      "label": "Watch",
      "type": "shell",
      "command": "empacker",
      "args": ["watch"],
      "group": "build",
      "isBackground": true
    }
  ]
}
```