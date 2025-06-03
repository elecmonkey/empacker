// empacker.config.ts
import type { EmpackerConfig } from './src/types';

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