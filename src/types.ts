import { BuildOptions } from 'esbuild';

export interface EmpackerTaskConfig {
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

// 主配置接口，支持单任务和多任务
export interface EmpackerConfig {
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

export interface BuildResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  outputFiles: string[];
  buildTime: number;
}

export interface MultiBuildResult {
  success: boolean;
  results: (BuildResult & { taskName?: string })[];
  totalBuildTime: number;
} 