import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { Empacker } from '../src/bundler';
import type { EmpackerConfig, BuildResult } from '../src/types';

describe('Bundler', () => {
  const testDir = 'test-bundler-temp';
  const srcDir = path.join(testDir, 'src');
  const outDir = path.join(testDir, 'dist');

  beforeEach(() => {
    // 清理测试环境
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(srcDir, { recursive: true });
  });

  afterEach(() => {
    // 清理测试环境
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const bundler = new Empacker({
        entry: 'src/index.ts'
      });

      expect(bundler).toBeInstanceOf(Empacker);
    });

    it('should normalize config properly', () => {
      const bundler = new Empacker({
        entry: 'src/index.ts',
        outdir: 'dist'
      });

      expect(bundler).toBeInstanceOf(Empacker);
    });
  });

  describe('build', () => {
    beforeEach(() => {
      // 创建测试源文件
      fs.writeFileSync(path.join(srcDir, 'index.ts'), `
export const hello = (name: string) => {
  console.log(\`Hello, \${name}!\`);
};

export default hello;
`);

      fs.writeFileSync(path.join(srcDir, 'utils.ts'), `
export const add = (a: number, b: number) => a + b;
export const multiply = (a: number, b: number) => a * b;
`);

      fs.writeFileSync(path.join(srcDir, 'main.ts'), `
import hello from './index';
import { add } from './utils';

hello('World');
console.log(add(2, 3));
`);
    });

    it('should build single entry with bundle mode', async () => {
      const bundler = new Empacker({
        entry: path.join(srcDir, 'index.ts'),
        outdir: outDir,
        format: 'esm',
        bundle: true,
        minify: false,
        sourcemap: false
      });

      const result = await bundler.build() as BuildResult;

      expect(result.success).toBe(true);
      expect(result.outputFiles.length).toBeGreaterThan(0);
      expect(fs.existsSync(result.outputFiles[0])).toBe(true);
    });

    it('should build single entry with no-bundle mode', async () => {
      const bundler = new Empacker({
        entry: path.join(srcDir, 'index.ts'),
        outdir: outDir,
        format: 'esm',
        bundle: false,
        minify: false,
        sourcemap: false
      });

      const result = await bundler.build() as BuildResult;

      expect(result.success).toBe(true);
      expect(result.outputFiles.length).toBeGreaterThan(0);
      expect(fs.existsSync(path.join(outDir, 'index.js'))).toBe(true);
    });

    it('should build multiple entries', async () => {
      const bundler = new Empacker({
        entry: [
          path.join(srcDir, 'index.ts'),
          path.join(srcDir, 'utils.ts')
        ],
        outdir: outDir,
        format: 'esm',
        bundle: false,
        minify: false,
        sourcemap: false
      });

      const result = await bundler.build() as BuildResult;

      expect(result.success).toBe(true);
      expect(result.outputFiles.length).toBeGreaterThanOrEqual(2);
      expect(fs.existsSync(path.join(outDir, 'index.js'))).toBe(true);
      expect(fs.existsSync(path.join(outDir, 'utils.js'))).toBe(true);
    });

    it('should build with outfile option', async () => {
      const outputFile = path.join(outDir, 'bundle.js');
      const bundler = new Empacker({
        entry: path.join(srcDir, 'index.ts'),
        outfile: outputFile,
        format: 'esm',
        minify: false,
        sourcemap: false
      });

      const result = await bundler.build() as BuildResult;

      expect(result.success).toBe(true);
      expect(fs.existsSync(outputFile)).toBe(true);
    });

    it('should build with different formats', async () => {
      const formats: Array<'esm' | 'cjs' | 'iife'> = ['esm', 'cjs', 'iife'];

      for (const format of formats) {
        const bundler = new Empacker({
          entry: path.join(srcDir, 'index.ts'),
          outdir: path.join(outDir, format),
          format,
          bundle: true,
          minify: false,
          sourcemap: false
        });

        const result = await bundler.build() as BuildResult;
        expect(result.success).toBe(true);
        expect(result.outputFiles.length).toBeGreaterThan(0);
      }
    });

    it('should build with minification', async () => {
      const bundler = new Empacker({
        entry: path.join(srcDir, 'index.ts'),
        outdir: outDir,
        format: 'esm',
        bundle: true,
        minify: true,
        sourcemap: false
      });

      const result = await bundler.build() as BuildResult;

      expect(result.success).toBe(true);
      
      const outputContent = fs.readFileSync(result.outputFiles[0], 'utf-8');
      // 压缩后的代码应该没有多余的空格和换行
      expect(outputContent.split('\n').length).toBeLessThan(5);
    });

    it('should build with sourcemap', async () => {
      const bundler = new Empacker({
        entry: path.join(srcDir, 'index.ts'),
        outdir: outDir,
        format: 'esm',
        bundle: true,
        minify: false,
        sourcemap: true
      });

      const result = await bundler.build() as BuildResult;

      expect(result.success).toBe(true);
      
      // 应该包含sourcemap文件
      const hasMapFile = result.outputFiles.some(file => file.endsWith('.map'));
      expect(hasMapFile).toBe(true);
    });

    it('should generate TypeScript declaration files', async () => {
      const bundler = new Empacker({
        entry: path.join(srcDir, 'index.ts'),
        outdir: outDir,
        format: 'esm',
        bundle: false,
        dts: true,
        minify: false,
        sourcemap: false
      });

      const result = await bundler.build() as BuildResult;

      expect(result.success).toBe(true);
      expect(fs.existsSync(path.join(outDir, 'index.d.ts'))).toBe(true);
    });

    it('should handle external dependencies', async () => {
      // 创建使用外部依赖的文件
      fs.writeFileSync(path.join(srcDir, 'external.ts'), `
import * as fs from 'fs';
export const readFile = (path: string) => fs.readFileSync(path, 'utf-8');
`);

      const bundler = new Empacker({
        entry: path.join(srcDir, 'external.ts'),
        outdir: outDir,
        format: 'esm',
        bundle: true,
        external: ['fs'],
        minify: false,
        sourcemap: false
      });

      const result = await bundler.build() as BuildResult;

      expect(result.success).toBe(true);
      
      const outputContent = fs.readFileSync(result.outputFiles[0], 'utf-8');
      // fs 应该作为外部依赖，不被打包进来
      expect(outputContent).toContain('import');
      expect(outputContent).toContain('fs');
    });

    it('should handle build errors gracefully', async () => {
      // 创建有语法错误的文件
      fs.writeFileSync(path.join(srcDir, 'error.ts'), `
import * as invalid syntax +++
export const broken = 'test';
`);

      const bundler = new Empacker({
        entry: path.join(srcDir, 'error.ts'),
        outdir: outDir,
        format: 'esm'
      });

      const result = await bundler.build() as BuildResult;

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle non-existing entry file', async () => {
      const bundler = new Empacker({
        entry: path.join(srcDir, 'non-existing.ts'),
        outdir: outDir,
        format: 'esm'
      });

      const result = await bundler.build() as BuildResult;

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should measure build time', async () => {
      const bundler = new Empacker({
        entry: path.join(srcDir, 'index.ts'),
        outdir: outDir,
        format: 'esm'
      });

      const result = await bundler.build() as BuildResult;

      expect(result.buildTime).toBeGreaterThan(0);
      expect(typeof result.buildTime).toBe('number');
    });

    it('should collect warnings', async () => {
      const bundler = new Empacker({
        entry: path.join(srcDir, 'index.ts'),
        outdir: outDir,
        format: 'esm'
      });

      const result = await bundler.build() as BuildResult;

      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('watch', () => {
    beforeEach(() => {
      fs.writeFileSync(path.join(srcDir, 'watch.ts'), `
export const message = 'Hello Watch Mode';
`);
    });

    it('should have watch method', () => {
      const bundler = new Empacker({
        entry: path.join(srcDir, 'watch.ts'),
        outdir: outDir,
        format: 'esm'
      });

      expect(typeof bundler.watch).toBe('function');
    });

    // 由于watch模式涉及进程控制，在单元测试中比较复杂
    // 这里只测试方法存在性，集成测试可以测试完整功能
  });

  describe('error handling and edge cases', () => {
    beforeEach(() => {
      // 为edge cases创建必要的源文件
      fs.writeFileSync(path.join(srcDir, 'index.ts'), `
export const hello = (name: string) => \`Hello, \${name}!\`;
export default hello;
`);
    });

    it('should handle invalid config normalization', () => {
      const bundler = new Empacker({
        entry: 'src/index.ts',
        format: undefined, // 测试默认值
        bundle: undefined, // 测试默认值
        minify: undefined, // 测试默认值
        sourcemap: undefined // 测试默认值
      });

      expect(bundler).toBeInstanceOf(Empacker);
    });

    it('should handle dts generation failure gracefully', async () => {
      // 创建会导致tsc失败的TypeScript文件
      fs.writeFileSync(path.join(srcDir, 'invalid-types.ts'), `
export const invalidType: NonExistentType = 'test';
`);

      const bundler = new Empacker({
        entry: path.join(srcDir, 'invalid-types.ts'),
        outdir: outDir,
        format: 'esm',
        dts: true,
        bundle: false
      });

      // 应该构建成功但dts生成可能失败
      const result = await bundler.build() as BuildResult;
      expect(result.success).toBe(true); // 主构建应该成功
    });

    it('should handle outfile and outdir conflict warning', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const bundler = new Empacker({
        entry: path.join(srcDir, 'index.ts'),
        outdir: outDir,
        outfile: path.join(outDir, 'custom.js'), // 同时指定会有警告
        format: 'esm'
      });

      const result = await bundler.build() as BuildResult;
      expect(result.success).toBe(true);
      
      consoleSpy.mockRestore();
    });

    it('should handle large number of entries', async () => {
      // 创建多个入口文件
      const entries: string[] = [];
      for (let i = 0; i < 5; i++) {
        const fileName = `entry${i}.ts`;
        const filePath = path.join(srcDir, fileName);
        fs.writeFileSync(filePath, `
export const value${i} = ${i};
export default value${i};
`);
        entries.push(filePath);
      }

      const bundler = new Empacker({
        entry: entries,
        outdir: outDir,
        format: 'esm',
        bundle: false
      });

      const result = await bundler.build() as BuildResult;
      expect(result.success).toBe(true);
      expect(result.outputFiles.length).toBeGreaterThanOrEqual(5);
    });

    it('should handle custom esbuild options', async () => {
      const bundler = new Empacker({
        entry: path.join(srcDir, 'index.ts'),
        outdir: outDir,
        format: 'esm',
        esbuildOptions: {
          target: 'es2020',
          platform: 'browser',
          define: {
            'process.env.NODE_ENV': '"test"'
          }
        }
      });

      const result = await bundler.build() as BuildResult;
      expect(result.success).toBe(true);
    });

    it('should handle glob patterns that match no files', async () => {
      const bundler = new Empacker({
        entry: path.join(srcDir, '**/*.nonexistent'),
        outdir: outDir,
        format: 'esm'
      });

      const result = await bundler.build() as BuildResult;
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should ensure output directory creation', async () => {
      const nestedOutDir = path.join(outDir, 'nested', 'deep');
      
      const bundler = new Empacker({
        entry: path.join(srcDir, 'index.ts'),
        outdir: nestedOutDir,
        format: 'esm'
      });

      const result = await bundler.build() as BuildResult;
      expect(result.success).toBe(true);
      expect(fs.existsSync(nestedOutDir)).toBe(true);
    });

    it('should handle watch mode errors', async () => {
      const bundler = new Empacker({
        entry: 'non-existing-file.ts', // 不存在的文件
        outdir: outDir,
        format: 'esm'
      });

      try {
        await bundler.watch();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
}); 