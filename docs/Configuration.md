# Empacker 配置文档

## 概述

Empacker 提供了灵活的配置选项，支持单任务和多任务模式。您可以通过配置文件或命令行参数来定制构建行为。

## 配置文件格式

Empacker 支持以下配置文件格式：

- `empacker.config.js` - JavaScript 模块
- `empacker.config.ts` - TypeScript 模块
- `empacker.config.mjs` - ES 模块
- `empacker.config.json` - JSON 文件

配置文件按优先级自动查找，优先级从高到低。

## 配置选项详解

### 基础配置

#### `entry`

**类型：** `string | string[]`

**默认值：** 无（必需）

**描述：** 入口文件路径，支持 glob 模式匹配。

**示例：**
```javascript
// 单个入口文件
entry: 'src/index.ts'

// 多个入口文件
entry: ['src/index.ts', 'src/utils.ts']

// 使用 glob 模式
entry: 'src/**/*.ts'
```

#### `outdir`

**类型：** `string`

**默认值：** `'dist'`

**描述：** 输出目录路径。当指定 `outfile` 时，此选项会被忽略。

**示例：**
```javascript
outdir: 'dist'
outdir: 'build'
outdir: './output'
```

#### `outfile`

**类型：** `string`

**默认值：** 无

**描述：** 输出文件名。指定此选项时，`outdir` 会被忽略。

**示例：**
```javascript
outfile: 'dist/bundle.js'
outfile: 'build/app.min.js'
```

#### `format`

**类型：** `'cjs' | 'esm' | 'iife'`

**默认值：** `'esm'`

**描述：** 输出格式。

- `'cjs'` - CommonJS 格式，适用于 Node.js
- `'esm'` - ES 模块格式，适用于现代浏览器和 Node.js
- `'iife'` - 立即执行函数表达式，适用于浏览器

**示例：**
```javascript
// 库项目
format: 'esm'

// Node.js 应用
format: 'cjs'

// 浏览器应用
format: 'iife'
```

### 构建选项

#### `bundle`

**类型：** `boolean`

**默认值：** `true`

**描述：** 是否将依赖打包成单个文件。

- `true` - 打包所有依赖到单个文件
- `false` - 保持文件结构，不打包依赖

**示例：**
```javascript
// 库项目，保持文件结构便于 tree-shaking
bundle: false

// 应用项目，打包成单个文件减少请求
bundle: true
```

#### `sourcemap`

**类型：** `boolean`

**默认值：** `false`

**描述：** 是否生成 source map 文件。

**示例：**
```javascript
// 开发环境
sourcemap: true

// 生产环境
sourcemap: false
```

#### `minify`

**类型：** `boolean`

**默认值：** `true`

**描述：** 是否压缩代码。

**示例：**
```javascript
// 开发环境
minify: false

// 生产环境
minify: true
```

#### `external`

**类型：** `string[]`

**默认值：** `[]`

**描述：** 外部依赖列表，这些依赖不会被打包。

**示例：**
```javascript
// 排除 React 相关依赖
external: ['react', 'react-dom']

// 排除 Node.js 内置模块
external: ['fs', 'path', 'crypto']

// 排除第三方库
external: ['lodash', 'moment', 'axios']
```

### 高级选项

#### `dts`

**类型：** `boolean`

**默认值：** `false`

**描述：** 是否生成 TypeScript 声明文件（.d.ts）。

**示例：**
```javascript
// 库项目，生成类型声明
dts: true

// 应用项目，不需要类型声明
dts: false
```

#### `watch`

**类型：** `boolean`

**默认值：** `false`

**描述：** 是否启用文件监听模式。

**注意：** 监听模式暂不支持多任务配置。

**示例：**
```javascript
// 开发时启用监听
watch: true

// 生产构建禁用监听
watch: false
```

#### `esbuildOptions`

**类型：** `Partial<BuildOptions>`

**默认值：** `{}`

**描述：** 自定义 esbuild 配置选项。

**示例：**
```javascript
esbuildOptions: {
  target: 'es2020',
  platform: 'browser',
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  loader: {
    '.svg': 'dataurl',
    '.png': 'dataurl'
  },
  alias: {
    '@': './src'
  }
}
```

### 多任务配置

#### `tasks`

**类型：** `EmpackerTaskConfig[]`

**默认值：** `[]`

**描述：** 多任务配置数组。每个任务可以有不同的配置。

**示例：**
```javascript
tasks: [
  {
    name: 'main',
    entry: 'src/index.ts',
    outdir: 'dist',
    format: 'esm',
    bundle: true,
    minify: true,
    external: ['react']
  },
  {
    name: 'cli',
    entry: 'src/cli.ts',
    outfile: 'dist/cli.cjs',
    format: 'cjs',
    bundle: true,
    minify: true,
    external: ['commander']
  }
]
```

## 配置示例

### 1. 基础库配置

```javascript
// empacker.config.js
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  sourcemap: false,
  minify: true,
  dts: true,
  external: ['react', 'react-dom']
};
```

### 2. 多格式库配置

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

### 3. 应用配置

```javascript
// empacker.config.js
export default {
  entry: 'src/main.ts',
  outfile: 'dist/app.js',
  format: 'iife',
  bundle: true,
  sourcemap: true,
  minify: false,
  esbuildOptions: {
    target: 'es2015',
    platform: 'browser',
    define: {
      'process.env.NODE_ENV': '"development"'
    }
  }
};
```

### 4. Node.js CLI 工具配置

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

### 5. 开发环境配置

```javascript
// empacker.config.js
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  minify: false,
  watch: true,
  external: ['react']
};
```

### 6. 生产环境配置

```javascript
// empacker.config.js
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  sourcemap: false,
  minify: true,
  external: ['react'],
  esbuildOptions: {
    target: 'es2020',
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  }
};
```

### 7. 复杂多任务配置

```javascript
// empacker.config.js
export default {
  tasks: [
    {
      name: 'main',
      entry: 'src/index.ts',
      outdir: 'dist',
      format: 'esm',
      bundle: true,
      minify: true,
      dts: true,
      external: ['react', 'react-dom']
    },
    {
      name: 'cli',
      entry: 'src/cli.ts',
      outfile: 'dist/cli.cjs',
      format: 'cjs',
      bundle: true,
      minify: true,
      external: ['commander', 'chalk']
    },
    {
      name: 'worker',
      entry: 'src/worker.ts',
      outdir: 'dist',
      format: 'esm',
      bundle: true,
      minify: true,
      external: ['worker_threads']
    }
  ]
};
```

## TypeScript 配置

### 类型安全的配置

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
  dts: true,
  external: ['react', 'react-dom'],
  esbuildOptions: {
    target: 'es2020',
    platform: 'browser'
  }
};

export default config;
```

### 多任务类型配置

```typescript
// empacker.config.ts
import { EmpackerConfig } from '@elecmonkey/empacker';

const config: EmpackerConfig = {
  tasks: [
    {
      name: 'main',
      entry: 'src/index.ts',
      outdir: 'dist',
      format: 'esm',
      bundle: true,
      minify: true,
      dts: true,
      external: ['react']
    },
    {
      name: 'cli',
      entry: 'src/cli.ts',
      outfile: 'dist/cli.cjs',
      format: 'cjs',
      bundle: true,
      minify: true,
      external: ['commander']
    }
  ]
};

export default config;
```

## 环境变量配置

### 使用环境变量

```javascript
// empacker.config.js
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  sourcemap: process.env.NODE_ENV === 'development',
  minify: process.env.NODE_ENV === 'production',
  dts: true,
  external: ['react'],
  esbuildOptions: {
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'development'}"`
    }
  }
};
```

### 条件配置

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
  watch: isDev,
  external: ['react'],
  esbuildOptions: {
    target: isDev ? 'es2020' : 'es2015',
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'development'}"`
    }
  }
};
```

## 最佳实践

### 1. 库项目配置

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

### 2. 应用项目配置

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

### 3. 开发环境配置

```javascript
// empacker.config.js
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  minify: false,
  watch: true,
  external: ['react']
};
```

### 4. 生产环境配置

```javascript
// empacker.config.js
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  sourcemap: false,
  minify: true,
  external: ['react'],
  esbuildOptions: {
    target: 'es2020',
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  }
};
```

## 配置验证

### 必需配置

- `entry` - 单任务模式下必需
- `tasks` - 多任务模式下至少需要一个任务

### 配置冲突

- `outdir` 和 `outfile` - 不能同时指定
- `watch` 和多任务 - 监听模式不支持多任务

### 配置优先级

1. 命令行参数（最高优先级）
2. 配置文件
3. 默认值（最低优先级）

## 常见配置问题

### 1. 入口文件不存在

```javascript
// ❌ 错误
entry: 'src/main.ts' // 文件不存在

// ✅ 正确
entry: 'src/index.ts' // 确保文件存在
```

### 2. 输出路径冲突

```javascript
// ❌ 错误
outdir: 'dist',
outfile: 'dist/bundle.js' // 同时指定 outdir 和 outfile

// ✅ 正确
outfile: 'dist/bundle.js' // 只指定 outfile
```

### 3. 外部依赖配置错误

```javascript
// ❌ 错误
external: ['react', 'react-dom', 'lodash'] // 依赖未安装

// ✅ 正确
external: ['react', 'react-dom'] // 确保依赖已安装
```

### 4. 监听模式配置错误

```javascript
// ❌ 错误
watch: true,
tasks: [/* 多任务配置 */] // 监听模式不支持多任务

// ✅ 正确
watch: true,
entry: 'src/index.ts' // 使用单任务配置
```