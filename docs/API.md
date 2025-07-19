# Empacker API 文档

## 概述

Empacker 是一个基于 esbuild 的快速 JavaScript/TypeScript 库打包器，提供了简单易用的 API 来构建和打包您的项目。

## 核心类

### Empacker

主要的打包器类，负责处理构建任务。

#### 构造函数

```typescript
constructor(config: EmpackerConfig)
```

**参数：**
- `config` - 构建配置对象

**示例：**
```typescript
import { Empacker } from '@elecmonkey/empacker';

const bundler = new Empacker({
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  minify: true
});
```

#### 方法

##### build()

执行构建任务，支持单任务和多任务模式。

```typescript
async build(): Promise<BuildResult | MultiBuildResult>
```

**返回值：**
- 单任务模式：返回 `BuildResult`
- 多任务模式：返回 `MultiBuildResult`

**示例：**
```typescript
// 单任务构建
const result = await bundler.build();
if (result.success) {
  console.log('构建成功！');
  console.log('输出文件:', result.outputFiles);
  console.log('构建时间:', result.buildTime);
} else {
  console.log('构建失败:', result.errors);
}

// 多任务构建
const multiResult = await bundler.build();
if (multiResult.success) {
  console.log('所有任务构建成功！');
  multiResult.results.forEach(taskResult => {
    console.log(`任务 ${taskResult.taskName}: ${taskResult.success ? '成功' : '失败'}`);
  });
}
```

##### watch()

启动文件监听模式，文件变化时自动重新构建。

```typescript
async watch(): Promise<void>
```

**注意：** 监听模式暂不支持多任务配置。

**示例：**
```typescript
console.log('启动监听模式...');
await bundler.watch();
// 程序会持续运行，监听文件变化
```

## 配置管理

### loadConfig()

加载配置文件。

```typescript
async loadConfig(configPath?: string): Promise<EmpackerConfig | null>
```

**参数：**
- `configPath` - 可选的配置文件路径

**返回值：**
- 成功时返回配置对象
- 未找到配置文件时返回 `null`

**示例：**
```typescript
import { loadConfig } from '@elecmonkey/empacker';

// 自动查找配置文件
const config = await loadConfig();
if (config) {
  console.log('找到配置文件');
} else {
  console.log('未找到配置文件');
}

// 指定配置文件路径
const customConfig = await loadConfig('./custom.config.js');
```

### createDefaultConfig()

创建默认配置文件内容。

```typescript
createDefaultConfig(format: 'js' | 'ts' | 'json' = 'js'): string
```

**参数：**
- `format` - 配置文件格式，支持 'js'、'ts'、'json'

**返回值：**
- 配置文件内容字符串

**示例：**
```typescript
import { createDefaultConfig } from '@elecmonkey/empacker';
import * as fs from 'fs';

// 创建 JavaScript 配置文件
const jsConfig = createDefaultConfig('js');
fs.writeFileSync('empacker.config.js', jsConfig);

// 创建 TypeScript 配置文件
const tsConfig = createDefaultConfig('ts');
fs.writeFileSync('empacker.config.ts', tsConfig);

// 创建 JSON 配置文件
const jsonConfig = createDefaultConfig('json');
fs.writeFileSync('empacker.config.json', jsonConfig);
```

### mergeConfig()

合并配置对象。

```typescript
mergeConfig(baseConfig: EmpackerConfig, overrideConfig: Partial<EmpackerConfig>): EmpackerConfig
```

**参数：**
- `baseConfig` - 基础配置
- `overrideConfig` - 覆盖配置

**返回值：**
- 合并后的配置对象

**示例：**
```typescript
import { mergeConfig } from '@elecmonkey/empacker';

const baseConfig = {
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm'
};

const overrideConfig = {
  minify: true,
  external: ['react']
};

const finalConfig = mergeConfig(baseConfig, overrideConfig);
// 结果：{ entry: 'src/index.ts', outdir: 'dist', format: 'esm', minify: true, external: ['react'] }
```

## 工具函数

### resolveEntries()

解析入口文件路径，支持 glob 模式。

```typescript
async resolveEntries(entry: string | string[]): Promise<string[]>
```

**参数：**
- `entry` - 入口文件路径或路径数组

**返回值：**
- 解析后的文件路径数组

**示例：**
```typescript
import { resolveEntries } from '@elecmonkey/empacker';

// 解析单个文件
const singleFile = await resolveEntries('src/index.ts');
console.log(singleFile); // ['src/index.ts']

// 解析多个文件
const multipleFiles = await resolveEntries(['src/index.ts', 'src/utils.ts']);
console.log(multipleFiles); // ['src/index.ts', 'src/utils.ts']

// 解析 glob 模式
const globFiles = await resolveEntries('src/**/*.ts');
console.log(globFiles); // ['src/index.ts', 'src/utils.ts', 'src/components/Button.ts', ...]
```

### fileExists()

检查文件是否存在。

```typescript
fileExists(filePath: string): boolean
```

**参数：**
- `filePath` - 文件路径

**返回值：**
- 文件存在时返回 `true`，否则返回 `false`

**示例：**
```typescript
import { fileExists } from '@elecmonkey/empacker';

if (fileExists('src/index.ts')) {
  console.log('入口文件存在');
} else {
  console.log('入口文件不存在');
}
```

### ensureDir()

确保目录存在，如果不存在则创建。

```typescript
ensureDir(dirPath: string): void
```

**参数：**
- `dirPath` - 目录路径

**示例：**
```typescript
import { ensureDir } from '@elecmonkey/empacker';

// 确保输出目录存在
ensureDir('dist');
ensureDir('dist/components');
```

### formatFileSize()

格式化文件大小显示。

```typescript
formatFileSize(bytes: number): string
```

**参数：**
- `bytes` - 文件大小（字节）

**返回值：**
- 格式化后的文件大小字符串

**示例：**
```typescript
import { formatFileSize } from '@elecmonkey/empacker';

console.log(formatFileSize(1024)); // "1.0 KB"
console.log(formatFileSize(1048576)); // "1.0 MB"
console.log(formatFileSize(512)); // "512 B"
```

### formatBuildTime()

格式化构建时间显示。

```typescript
formatBuildTime(milliseconds: number): string
```

**参数：**
- `milliseconds` - 构建时间（毫秒）

**返回值：**
- 格式化后的时间字符串

**示例：**
```typescript
import { formatBuildTime } from '@elecmonkey/empacker';

console.log(formatBuildTime(500)); // "500ms"
console.log(formatBuildTime(1500)); // "1.50s"
console.log(formatBuildTime(65000)); // "65.00s"
```

## 类型定义

### EmpackerConfig

主配置接口，支持单任务和多任务模式。

```typescript
interface EmpackerConfig {
  /** 任务名称 */
  name?: string;
  /** 入口文件路径（单任务模式时必需） */
  entry?: string | string[];
  /** 输出目录 */
  outdir?: string;
  /** 输出文件名 */
  outfile?: string;
  /** 打包格式 */
  format?: 'cjs' | 'esm' | 'iife';
  /** 是否打包成单个文件 */
  bundle?: boolean;
  /** 是否生成 source map */
  sourcemap?: boolean;
  /** 是否压缩代码 */
  minify?: boolean;
  /** 外部依赖 */
  external?: string[];
  /** 是否监听文件变化 */
  watch?: boolean;
  /** 是否生成 TypeScript 声明文件 */
  dts?: boolean;
  /** 自定义 esbuild 配置 */
  esbuildOptions?: Partial<BuildOptions>;
  /** 多任务配置 */
  tasks?: EmpackerTaskConfig[];
}
```

### EmpackerTaskConfig

单个任务的配置接口。

```typescript
interface EmpackerTaskConfig {
  /** 任务名称 */
  name?: string;
  /** 入口文件路径 */
  entry: string | string[];
  /** 输出目录 */
  outdir?: string;
  /** 输出文件名 */
  outfile?: string;
  /** 打包格式 */
  format?: 'cjs' | 'esm' | 'iife';
  /** 是否打包成单个文件 */
  bundle?: boolean;
  /** 是否生成 source map */
  sourcemap?: boolean;
  /** 是否压缩代码 */
  minify?: boolean;
  /** 外部依赖 */
  external?: string[];
  /** 是否监听文件变化 */
  watch?: boolean;
  /** 是否生成 TypeScript 声明文件 */
  dts?: boolean;
  /** 自定义 esbuild 配置 */
  esbuildOptions?: Partial<BuildOptions>;
}
```

### BuildResult

单任务构建结果接口。

```typescript
interface BuildResult {
  /** 构建是否成功 */
  success: boolean;
  /** 错误信息列表 */
  errors: string[];
  /** 警告信息列表 */
  warnings: string[];
  /** 输出文件路径列表 */
  outputFiles: string[];
  /** 构建耗时（毫秒） */
  buildTime: number;
}
```

### MultiBuildResult

多任务构建结果接口。

```typescript
interface MultiBuildResult {
  /** 所有任务是否都成功 */
  success: boolean;
  /** 各任务的构建结果 */
  results: (BuildResult & { taskName?: string })[];
  /** 总构建耗时（毫秒） */
  totalBuildTime: number;
}
```

## 使用示例

### 基础使用

```typescript
import { Empacker } from '@elecmonkey/empacker';

// 创建打包器实例
const bundler = new Empacker({
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  minify: true,
  external: ['react']
});

// 执行构建
const result = await bundler.build();
console.log('构建结果:', result);
```

### 多任务构建

```typescript
import { Empacker } from '@elecmonkey/empacker';

const bundler = new Empacker({
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
});

const result = await bundler.build();
if (result.success) {
  console.log('所有任务构建成功！');
  result.results.forEach(taskResult => {
    console.log(`任务 ${taskResult.taskName}: ${taskResult.outputFiles.length} 个文件`);
  });
}
```

### 监听模式

```typescript
import { Empacker } from '@elecmonkey/empacker';

const bundler = new Empacker({
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  watch: true
});

console.log('启动监听模式...');
await bundler.watch();
// 程序会持续运行，监听文件变化并自动重新构建
```

### 配置文件加载

```typescript
import { Empacker, loadConfig } from '@elecmonkey/empacker';

// 加载配置文件
const config = await loadConfig();
if (config) {
  const bundler = new Empacker(config);
  const result = await bundler.build();
  console.log('构建完成:', result.success);
} else {
  console.log('未找到配置文件');
}
```

### 自定义 esbuild 配置

```typescript
import { Empacker } from '@elecmonkey/empacker';

const bundler = new Empacker({
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  esbuildOptions: {
    target: 'es2020',
    platform: 'browser',
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    loader: {
      '.svg': 'dataurl',
      '.png': 'dataurl'
    }
  }
});

await bundler.build();
```

### 生成 TypeScript 声明文件

```typescript
import { Empacker } from '@elecmonkey/empacker';

const bundler = new Empacker({
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  dts: true, // 生成 .d.ts 文件
  external: ['react']
});

await bundler.build();
// 会生成 dist/index.js 和 dist/index.d.ts
```

### 使用 Glob 模式

```typescript
import { Empacker } from '@elecmonkey/empacker';

const bundler = new Empacker({
  entry: 'src/**/*.ts', // 匹配所有 TypeScript 文件
  outdir: 'dist',
  format: 'esm',
  bundle: false, // 保持文件结构
  external: ['react']
});

await bundler.build();
```

### 错误处理

```typescript
import { Empacker } from '@elecmonkey/empacker';

try {
  const bundler = new Empacker({
    entry: 'src/index.ts',
    outdir: 'dist'
  });

  const result = await bundler.build();
  
  if (result.success) {
    console.log('构建成功！');
    console.log('输出文件:', result.outputFiles);
    console.log('构建时间:', result.buildTime);
  } else {
    console.log('构建失败:');
    result.errors.forEach(error => {
      console.log(`  - ${error}`);
    });
    result.warnings.forEach(warning => {
      console.log(`  ⚠️  ${warning}`);
    });
  }
} catch (error) {
  console.error('构建过程中发生错误:', error);
}
```