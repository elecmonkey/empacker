import * as fs from 'fs';
import * as path from 'path';
import * as esbuild from 'esbuild';
import { EmpackerConfig } from './types.js';
import { fileExists } from './utils.js';

const CONFIG_FILES = [
  'empacker.config.js',
  'empacker.config.ts',
  'empacker.config.mjs',
  'empacker.config.json'
];

/**
 * 加载配置文件
 */
export async function loadConfig(configPath?: string): Promise<EmpackerConfig | null> {
  // 如果指定了配置文件路径
  if (configPath) {
    if (!fileExists(configPath)) {
      throw new Error(`配置文件不存在: ${configPath}`);
    }
    return await loadConfigFile(configPath);
  }

  // 自动查找配置文件
  for (const configFile of CONFIG_FILES) {
    const fullPath = path.resolve(process.cwd(), configFile);
    if (fileExists(fullPath)) {
      return await loadConfigFile(fullPath);
    }
  }

  return null;
}

/**
 * 加载指定的配置文件
 */
async function loadConfigFile(filePath: string): Promise<EmpackerConfig> {
  const ext = path.extname(filePath);

  try {
    if (ext === '.json') {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } else if (ext === '.ts') {
      // 对于 TypeScript 文件，使用 esbuild 编译后再导入
      const result = await esbuild.build({
        entryPoints: [filePath],
        bundle: false,
        platform: 'node',
        target: 'node16',
        format: 'esm',
        write: false,
        loader: {
          '.ts': 'ts'
        }
      });

      if (result.outputFiles && result.outputFiles[0]) {
        // 创建临时文件
        const tempPath = filePath.replace('.ts', '.temp.mjs');
        fs.writeFileSync(tempPath, result.outputFiles[0].text);
        
        try {
          // 导入编译后的文件
          const configModule = await import(path.resolve(tempPath));
          return configModule.default || configModule;
        } finally {
          // 清理临时文件
          if (fileExists(tempPath)) {
            fs.unlinkSync(tempPath);
          }
        }
      } else {
        throw new Error('编译 TypeScript 配置文件失败');
      }
    } else {
      // 对于 .js, .mjs 文件，使用动态导入
      const configModule = await import(path.resolve(filePath));
      return configModule.default || configModule;
    }
  } catch (error) {
    throw new Error(`加载配置文件失败 ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 创建默认配置文件
 */
export function createDefaultConfig(format: 'js' | 'ts' | 'json' = 'js'): string {
  const configs = {
    js: `// empacker.config.js
export default {
  // 单任务配置（兼容方式）
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  sourcemap: false,
  minify: true,
  dts: false,
  external: ['esbuild'],
  
  // 多任务配置（推荐）
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
`,
    ts: `// empacker.config.ts
import { EmpackerConfig } from 'empacker';

const config: EmpackerConfig = {
  // 单任务配置（兼容方式）
  entry: 'src/index.ts',
  outdir: 'dist',
  format: 'esm',
  bundle: true,
  sourcemap: false,
  minify: true,
  dts: false,
  external: ['esbuild'],
  
  // 多任务配置（推荐）
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
`,
    json: `{
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
`
  };

  return configs[format];
}

/**
 * 合并配置
 */
export function mergeConfig(baseConfig: EmpackerConfig, overrideConfig: Partial<EmpackerConfig>): EmpackerConfig {
  return {
    ...baseConfig,
    ...overrideConfig,
    // 对于数组类型的配置，进行合并而非覆盖
    external: [
      ...(baseConfig.external || []),
      ...(overrideConfig.external || [])
    ],
    esbuildOptions: {
      ...baseConfig.esbuildOptions,
      ...overrideConfig.esbuildOptions
    }
  };
} 