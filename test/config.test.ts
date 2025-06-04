import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, createDefaultConfig, mergeConfig } from '../src/config';
import type { EmpackerConfig } from '../src/types';

describe('Config', () => {
  const testDir = 'test-config-temp';
  
  beforeEach(() => {
    // 清理测试环境
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // 清理测试环境
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('loadConfig', () => {
    it('should load JavaScript config file', async () => {
      const configPath = path.join(testDir, 'empacker.config.js');
      const configContent = `export default {
        entry: 'src/index.ts',
        outdir: 'dist',
        format: 'esm',
        minify: true
      };`;
      
      fs.writeFileSync(configPath, configContent);
      
      const config = await loadConfig(configPath);
      expect(config).toEqual({
        entry: 'src/index.ts',
        outdir: 'dist',
        format: 'esm',
        minify: true
      });
    });

    it('should load TypeScript config file', async () => {
      const configPath = path.join(testDir, 'empacker.config.ts');
      const configContent = `import type { EmpackerConfig } from '../src/types';

export default {
  entry: 'src/main.ts',
  outdir: 'lib',
  format: 'cjs'
} as EmpackerConfig;`;
      
      fs.writeFileSync(configPath, configContent);
      
      const config = await loadConfig(configPath);
      expect(config).toEqual({
        entry: 'src/main.ts',
        outdir: 'lib',
        format: 'cjs'
      });
    });

    it('should load JSON config file', async () => {
      const configPath = path.join(testDir, 'empacker.config.json');
      const configContent = JSON.stringify({
        entry: 'src/app.ts',
        outdir: 'build',
        format: 'iife',
        minify: false
      });
      
      fs.writeFileSync(configPath, configContent);
      
      const config = await loadConfig(configPath);
      expect(config).toEqual({
        entry: 'src/app.ts',
        outdir: 'build',
        format: 'iife',
        minify: false
      });
    });

    it('should throw error for non-existing file', async () => {
      await expect(loadConfig('non-existing-config.js')).rejects.toThrow('配置文件不存在');
    });

    it('should return null when no config specified and none found', async () => {
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir);
        const config = await loadConfig();
        expect(config).toBeNull();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle syntax errors in config file', async () => {
      const configPath = path.join(testDir, 'syntax-error.config.js');
      const configContent = `export default {
        entry: 'src/index.ts',
        // 语法错误：缺少引号和逗号
        outdir: dist
        format: esm
      };`;
      
      fs.writeFileSync(configPath, configContent);
      
      await expect(loadConfig(configPath)).rejects.toThrow();
    });

    it('should handle invalid JSON config file', async () => {
      const configPath = path.join(testDir, 'invalid.config.json');
      const configContent = `{
        "entry": "src/index.ts",
        "outdir": "dist",
        // JSON中不允许注释
        "format": "esm"
      }`;
      
      fs.writeFileSync(configPath, configContent);
      
      await expect(loadConfig(configPath)).rejects.toThrow();
    });
  });

  describe('createDefaultConfig', () => {
    it('should create JavaScript config template', () => {
      const config = createDefaultConfig('js');
      expect(config).toContain('export default');
      expect(config).toContain('entry:');
      expect(config).toContain('outdir:');
      expect(config).toContain('format:');
    });

    it('should create TypeScript config template', () => {
      const config = createDefaultConfig('ts');
      expect(config).toContain('import { EmpackerConfig }');
      expect(config).toContain('const config: EmpackerConfig');
      expect(config).toContain('export default config');
    });

    it('should create JSON config template', () => {
      const config = createDefaultConfig('json');
      const parsed = JSON.parse(config);
      expect(parsed).toHaveProperty('entry');
      expect(parsed).toHaveProperty('outdir');
      expect(parsed).toHaveProperty('format');
    });

    it('should default to js format', () => {
      const config = createDefaultConfig();
      expect(config).toContain('export default');
    });
  });

  describe('mergeConfig', () => {
    it('should merge config objects', () => {
      const baseConfig: EmpackerConfig = {
        entry: 'src/index.ts',
        outdir: 'dist',
        format: 'esm'
      };

      const overrideConfig: Partial<EmpackerConfig> = {
        format: 'cjs',
        minify: true
      };

      const result = mergeConfig(baseConfig, overrideConfig);
      expect(result).toEqual({
        entry: 'src/index.ts',
        outdir: 'dist',
        format: 'cjs',
        minify: true,
        external: [],
        esbuildOptions: {}
      });
    });

    it('should merge external arrays', () => {
      const baseConfig: EmpackerConfig = {
        entry: 'src/index.ts',
        external: ['react']
      };

      const overrideConfig: Partial<EmpackerConfig> = {
        external: ['vue']
      };

      const result = mergeConfig(baseConfig, overrideConfig);
      expect(result.external).toEqual(['react', 'vue']);
    });

    it('should merge esbuildOptions', () => {
      const baseConfig: EmpackerConfig = {
        entry: 'src/index.ts',
        esbuildOptions: {
          target: 'es2015'
        }
      };

      const overrideConfig: Partial<EmpackerConfig> = {
        esbuildOptions: {
          platform: 'node'
        }
      };

      const result = mergeConfig(baseConfig, overrideConfig);
      expect(result.esbuildOptions).toEqual({
        target: 'es2015',
        platform: 'node'
      });
    });
  });
}); 