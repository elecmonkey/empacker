# Empacker

一个基于 esbuild 的快速 JavaScript/TypeScript 库打包器

## 特性

- 基于 esbuild
- 支持 CommonJS、ESM、IIFE 格式
- 内置 TypeScript 支持
- 文件变化自动重新构建
- glob 模式匹配入口文件

## 安装

```bash
# 全局安装
pnpm add -g @elecmonkey/empacker

# 或在项目中安装
pnpm add -D @elecmonkey/empacker
```

## 快速开始

### 使用 CLI

```bash
# 初始化配置文件
empacker init

# 构建项目
empacker build

# 监听模式
empacker watch

# 直接指定入口文件构建
empacker build -e src/index.ts -o dist
```

### 使用配置文件

创建 `empacker.config.js` 或 `empacker.config.ts`，参考 [配置示例](#配置示例)。

### 编程式使用

```typescript
import { Empacker } from 'empacker';

const bundler = new Empacker({
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  minify: true
});

// 构建
const result = await bundler.build();
console.log('构建结果:', result);

// 监听模式
await bundler.watch();
```

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `entry` | `string \| string[]` | - | 入口文件路径，支持 glob 模式 |
| `outdir` | `string` | `'dist'` | 输出目录 |
| `outfile` | `string` | - | 输出文件名（与 outdir 二选一） |
| `format` | `'cjs' \| 'esm' \| 'iife'` | `'esm'` | 输出格式 |
| `bundle` | `boolean` | `true` | 是否打包成单个文件 |
| `sourcemap` | `boolean` | `false` | 是否生成 source map |
| `minify` | `boolean` | `true` | 是否压缩代码 |
| `dts` | `boolean` | `false` | 是否生成 TypeScript 声明文件 |
| `external` | `string[]` | `[]` | 外部依赖列表 |
| `watch` | `boolean` | `false` | 是否启用监听模式 |
| `esbuildOptions` | `Partial<BuildOptions>` | `{}` | 自定义 esbuild 配置 |

## CLI 命令

### `empacker build`

构建项目

```bash
empacker build [options]

选项:
  -c, --config <config>        配置文件路径
  -e, --entry <entry>          入口文件
  -o, --outdir <outdir>        输出目录
  --outfile <outfile>          输出文件名
  -f, --format <format>        输出格式 (cjs|esm|iife)
  --bundle                     打包成单个文件
  --no-bundle                  不打包，保持文件结构
  --sourcemap                  生成 source map
  --no-sourcemap              不生成 source map
  --minify                     压缩代码
  --no-minify                  不压缩代码
  --dts                        生成 TypeScript 声明文件
  --external <external...>     外部依赖
```

### `empacker watch`

监听文件变化并自动构建

```bash
empacker watch [options]

选项: (与 build 命令相同)
```

### `empacker init`

创建配置文件

```bash
empacker init [options]

选项:
  -f, --format <format>        配置文件格式 (js|ts|json)
```

## 配置示例

### 构建单个入口文件

```bash
empacker build -e src/index.ts --outfile dist/bundle.js --minify
```

### 构建多个入口文件

```javascript
// empacker.config.js
export default {
  entry: ['src/index.ts', 'src/worker.ts'],
  outdir: 'dist',
  format: 'esm'
};
```

### 使用 Glob 模式

```javascript
// empacker.config.js
export default {
  entry: 'src/**/*.ts',
  outdir: 'dist',
  external: ['react']
};
```

### 自定义 esbuild 配置

```javascript
// empacker.config.js
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  esbuildOptions: {
    target: 'es2020',
    platform: 'browser',
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  }
};
```

### 不打包，保持文件结构

```javascript
// empacker.config.js
export default {
  entry: 'src/**/*.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: false, // 不打包，保持原有文件结构
  dts: true, // 同时生成声明文件
  external: ['react']
};
```

### 生成声明文件的库项目

```javascript
// empacker.config.js
export default {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  minify: true,
  dts: true, // 生成 .d.ts 文件
  external: ['lodash']
};
```

### TypeScript 配置类型提示

创建 `empacker.config.ts`:

```typescript
import type { EmpackerConfig } from 'empacker';

const config: EmpackerConfig = {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  sourcemap: false,
  minify: true,
  dts: true,
  external: ['react', 'react-dom']
};

export default config;
```

### 多任务配置

```typescript
import type { EmpackerConfig } from 'empacker';

const config: EmpackerConfig = {
  // 多任务配置
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
      external: ['commander', 'chalk']
    }
  ]
};

export default config;
```

## API 参考

### `Empacker`

主要的打包器类

#### `constructor(config: EmpackerConfig)`

创建打包器实例

#### `build(): Promise<BuildResult>`

执行构建

#### `watch(): Promise<void>`

启动监听模式

### `loadConfig(configPath?: string): Promise<EmpackerConfig | null>`

加载配置文件

### `createDefaultConfig(format?: 'js' | 'ts' | 'json'): string`

创建默认配置文件内容

### `mergeConfig(baseConfig: EmpackerConfig, overrideConfig: Partial<EmpackerConfig>): EmpackerConfig`

合并配置

## 许可证

MIT