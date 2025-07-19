# Empacker 使用指南

## 概述

Empacker 是一个基于 esbuild 的快速 JavaScript/TypeScript 库打包器，专为现代前端开发而设计。它提供了简单易用的 API 和命令行工具，帮助您快速构建和打包项目。

## 特性

- ⚡ **极速构建** - 基于 esbuild，构建速度极快
- 🔧 **TypeScript 支持** - 原生支持 TypeScript，无需额外配置
- 📦 **多格式输出** - 支持 ESM、CommonJS、IIFE 格式
- 🎯 **多任务构建** - 支持同时构建多个入口文件
- 👀 **文件监听** - 开发时自动重新构建
- 📝 **类型声明** - 自动生成 TypeScript 声明文件
- 🎨 **灵活配置** - 支持多种配置文件格式
- 🔍 **Glob 支持** - 支持 glob 模式匹配入口文件

## 安装

### 全局安装

```bash
# 使用 pnpm（推荐）
pnpm add -g @elecmonkey/empacker

# 使用 npm
npm install -g @elecmonkey/empacker

# 使用 yarn
yarn global add @elecmonkey/empacker
```

### 本地安装

```bash
# 使用 pnpm（推荐）
pnpm add -D @elecmonkey/empacker

# 使用 npm
npm install -D @elecmonkey/empacker

# 使用 yarn
yarn add -D @elecmonkey/empacker
```

### 验证安装

```bash
# 查看版本
empacker --version

# 查看帮助
empacker --help
```

## 快速开始

### 1. 创建项目

```bash
# 创建项目目录
mkdir my-empacker-project
cd my-empacker-project

# 初始化 package.json
pnpm init

# 安装 Empacker
pnpm add -D @elecmonkey/empacker
```

### 2. 创建源代码

```bash
# 创建源代码目录
mkdir src

# 创建入口文件
touch src/index.ts
```

在 `src/index.ts` 中添加一些代码：

```typescript
// src/index.ts
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function add(a: number, b: number): number {
  return a + b;
}

export default {
  greet,
  add
};
```

### 3. 初始化配置

```bash
# 创建配置文件
empacker init
```

这会创建一个 `empacker.config.js` 文件，内容如下：

```javascript
// empacker.config.js
export default {
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
    }
  ]
};
```

### 4. 构建项目

```bash
# 构建项目
empacker build
```

构建完成后，您会在 `dist` 目录下看到生成的文件：

```
dist/
├── index.js
└── index.d.ts (如果启用了 dts)
```

### 5. 开发模式

```bash
# 启动监听模式
empacker watch
```

现在当您修改源代码时，Empacker 会自动重新构建。

## 项目结构示例

### 基础项目结构

```
my-empacker-project/
├── src/
│   ├── index.ts          # 主入口文件
│   ├── utils.ts          # 工具函数
│   └── types.ts          # 类型定义
├── dist/                 # 构建输出目录
├── empacker.config.js    # Empacker 配置
├── package.json
└── README.md
```

### 多入口项目结构

```
my-empacker-project/
├── src/
│   ├── index.ts          # 主库入口
│   ├── cli.ts            # CLI 工具入口
│   ├── worker.ts         # Worker 入口
│   ├── utils/
│   │   ├── index.ts
│   │   ├── string.ts
│   │   └── math.ts
│   └── types/
│       └── index.ts
├── dist/
├── empacker.config.js
├── package.json
└── README.md
```

## 常见用例

### 1. 构建 JavaScript 库

**项目结构：**
```
my-library/
├── src/
│   ├── index.ts
│   ├── utils.ts
│   └── types.ts
├── empacker.config.js
└── package.json
```

**配置文件：**
```javascript
// empacker.config.js
export default {
  tasks: [
    {
      name: 'esm',
      entry: 'src/index.ts',
      outdir: 'dist',
      format: 'esm',
      bundle: true,
      minify: true,
      dts: true,
      external: ['react']
    },
    {
      name: 'cjs',
      entry: 'src/index.ts',
      outdir: 'dist',
      format: 'cjs',
      bundle: true,
      minify: true,
      dts: true,
      external: ['react']
    }
  ]
};
```

**构建命令：**
```bash
empacker build
```

**输出：**
```
dist/
├── index.js      # ESM 格式
├── index.d.ts    # TypeScript 声明
└── index.cjs     # CommonJS 格式
```

### 2. 构建 React 组件库

**项目结构：**
```
react-components/
├── src/
│   ├── index.ts
│   ├── Button/
│   │   ├── index.ts
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   ├── Input/
│   │   ├── index.ts
│   │   ├── Input.tsx
│   │   └── Input.test.tsx
│   └── utils/
│       └── index.ts
├── empacker.config.js
└── package.json
```

**配置文件：**
```javascript
// empacker.config.js
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  minify: true,
  dts: true,
  external: ['react', 'react-dom'],
  esbuildOptions: {
    target: 'es2020',
    platform: 'browser',
    jsx: 'automatic'
  }
};
```

**构建命令：**
```bash
empacker build
```

### 3. 构建 Node.js CLI 工具

**项目结构：**
```
my-cli/
├── src/
│   ├── cli.ts
│   ├── commands/
│   │   ├── build.ts
│   │   └── dev.ts
│   └── utils/
│       └── index.ts
├── empacker.config.js
└── package.json
```

**配置文件：**
```javascript
// empacker.config.js
export default {
  entry: 'src/cli.ts',
  outfile: 'dist/cli.cjs',
  format: 'cjs',
  bundle: true,
  minify: true,
  external: ['commander', 'chalk', 'fs', 'path']
};
```

**package.json 配置：**
```json
{
  "name": "my-cli",
  "bin": {
    "my-cli": "./dist/cli.cjs"
  },
  "scripts": {
    "build": "empacker build",
    "dev": "empacker watch"
  }
}
```

**构建命令：**
```bash
empacker build
```

### 4. 构建浏览器应用

**项目结构：**
```
browser-app/
├── src/
│   ├── main.ts
│   ├── components/
│   │   └── App.ts
│   └── styles/
│       └── main.css
├── public/
│   └── index.html
├── empacker.config.js
└── package.json
```

**配置文件：**
```javascript
// empacker.config.js
export default {
  entry: 'src/main.ts',
  outfile: 'dist/app.js',
  format: 'iife',
  bundle: true,
  sourcemap: process.env.NODE_ENV === 'development',
  minify: process.env.NODE_ENV === 'production',
  esbuildOptions: {
    target: 'es2015',
    platform: 'browser',
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'development'}"`
    }
  }
};
```

**构建命令：**
```bash
# 开发环境
NODE_ENV=development empacker build

# 生产环境
NODE_ENV=production empacker build
```

## 开发工作流

### 1. 开发环境设置

**package.json 脚本：**
```json
{
  "scripts": {
    "dev": "empacker watch",
    "build": "empacker build",
    "build:prod": "NODE_ENV=production empacker build --minify --no-sourcemap",
    "type-check": "tsc --noEmit"
  }
}
```

**开发配置文件：**
```javascript
// empacker.config.js
const isDev = process.env.NODE_ENV === 'development';

export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  sourcemap: isDev,
  minify: !isDev,
  dts: true,
  external: ['react'],
  esbuildOptions: {
    target: isDev ? 'es2020' : 'es2015',
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'development'}"`
    }
  }
};
```

### 2. 开发流程

```bash
# 1. 启动开发模式
pnpm dev

# 2. 修改源代码（自动重新构建）

# 3. 类型检查
pnpm type-check

# 4. 生产构建
pnpm build:prod
```

### 3. 测试集成

**package.json 脚本：**
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "build": "empacker build",
    "dev": "empacker watch"
  }
}
```

**测试配置：**
```javascript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true
  }
});
```

## 最佳实践

### 1. 项目结构

**推荐的目录结构：**
```
project/
├── src/
│   ├── index.ts          # 主入口
│   ├── cli.ts            # CLI 入口（如果有）
│   ├── components/       # 组件目录
│   ├── utils/            # 工具函数
│   ├── types/            # 类型定义
│   └── constants/        # 常量定义
├── tests/                # 测试文件
├── docs/                 # 文档
├── examples/             # 示例代码
├── dist/                 # 构建输出
├── empacker.config.js    # Empacker 配置
├── package.json
├── README.md
└── .gitignore
```

### 2. 配置文件管理

**分离开发和生产配置：**
```javascript
// empacker.config.js
const isDev = process.env.NODE_ENV === 'development';

const baseConfig = {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  external: ['react']
};

const devConfig = {
  ...baseConfig,
  sourcemap: true,
  minify: false,
  watch: true
};

const prodConfig = {
  ...baseConfig,
  sourcemap: false,
  minify: true,
  dts: true
};

export default isDev ? devConfig : prodConfig;
```

### 3. 外部依赖管理

**合理设置外部依赖：**
```javascript
// empacker.config.js
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  external: [
    // React 相关
    'react',
    'react-dom',
    
    // Node.js 内置模块
    'fs',
    'path',
    'crypto',
    
    // 大型第三方库
    'lodash',
    'moment',
    'axios'
  ]
};
```

### 4. 类型声明文件

**启用类型声明生成：**
```javascript
// empacker.config.js
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  dts: true, // 生成 .d.ts 文件
  external: ['react']
};
```

**package.json 配置：**
```json
{
  "name": "my-library",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ]
}
```

### 5. 性能优化

**使用合适的打包策略：**
```javascript
// 库项目：保持文件结构
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: false, // 不打包，便于 tree-shaking
  dts: true
};

// 应用项目：打包成单个文件
export default {
  entry: 'src/main.ts',
  outfile: 'dist/app.js',
  format: 'iife',
  bundle: true, // 打包，减少请求
  minify: true
};
```

### 6. 错误处理

**添加错误处理：**
```javascript
// build.js
import { Empacker } from '@elecmonkey/empacker';

async function build() {
  try {
    const bundler = new Empacker({
      entry: 'src/index.ts',
      outdir: 'dist'
    });

    const result = await bundler.build();
    
    if (result.success) {
      console.log('✅ 构建成功');
      console.log('📦 输出文件:', result.outputFiles);
    } else {
      console.log('❌ 构建失败');
      result.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
      process.exit(1);
    }
  } catch (error) {
    console.error('构建过程中发生错误:', error);
    process.exit(1);
  }
}

build();
```

## 故障排除

### 常见问题

**1. 找不到模块**
```
❌ 构建失败: Cannot find module 'react'
```

**解决方案：**
- 安装缺失的依赖：`pnpm add react`
- 或将依赖添加到 `external` 配置中

**2. TypeScript 编译错误**
```
❌ 构建失败: Type 'string' is not assignable to type 'number'
```

**解决方案：**
- 检查 TypeScript 代码中的类型错误
- 运行 `tsc --noEmit` 进行类型检查

**3. 监听模式不工作**
```
❌ 监听模式暂不支持多任务配置
```

**解决方案：**
- 使用单任务配置
- 或分别监听每个任务

**4. 输出文件过大**
```
📦 输出文件: dist/index.js (2.5 MB)
```

**解决方案：**
- 将大型依赖添加到 `external` 配置中
- 使用 `bundle: false` 保持文件结构
- 检查是否有不必要的依赖被打包

### 调试技巧

**1. 启用详细日志：**
```bash
# 查看构建详情
empacker build --verbose
```

**2. 检查配置文件：**
```bash
# 验证配置文件语法
node -e "import('./empacker.config.js').then(console.log)"
```

**3. 分析构建结果：**
```javascript
// 查看构建统计
const result = await bundler.build();
console.log('构建时间:', result.buildTime);
console.log('输出文件:', result.outputFiles);
console.log('警告:', result.warnings);
```

## 进阶用法

### 1. 自定义 esbuild 配置

```javascript
// empacker.config.js
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  esbuildOptions: {
    target: 'es2020',
    platform: 'browser',
    define: {
      'process.env.NODE_ENV': '"production"',
      'global': 'globalThis'
    },
    loader: {
      '.svg': 'dataurl',
      '.png': 'dataurl',
      '.css': 'css'
    },
    alias: {
      '@': './src',
      '~': './src'
    }
  }
};
```

### 2. 多环境配置

```javascript
// empacker.config.js
const env = process.env.NODE_ENV || 'development';

const configs = {
  development: {
    entry: 'src/index.ts',
    outdir: 'dist',
    format: 'esm',
    sourcemap: true,
    minify: false,
    watch: true
  },
  production: {
    entry: 'src/index.ts',
    outdir: 'dist',
    format: 'esm',
    sourcemap: false,
    minify: true,
    dts: true
  }
};

export default configs[env];
```

### 3. 条件构建

```javascript
// empacker.config.js
const isLibrary = process.env.BUILD_TYPE === 'library';

export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: !isLibrary, // 库项目不打包，应用项目打包
  dts: isLibrary, // 只有库项目生成类型声明
  external: isLibrary ? ['react'] : []
};
```

## 总结

Empacker 提供了一个简单而强大的构建解决方案，适用于各种 JavaScript/TypeScript 项目。通过合理配置和使用最佳实践，您可以快速构建高质量的库和应用程序。

记住：
- 选择合适的输出格式
- 合理设置外部依赖
- 使用监听模式提高开发效率
- 为库项目生成类型声明
- 根据项目类型选择合适的打包策略

开始使用 Empacker，享受快速构建的乐趣吧！🚀