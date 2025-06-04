import { describe, it, expect } from 'vitest';
import * as EmpackerModule from '../src/index';

describe('Index', () => {
  describe('exports', () => {
    it('should export Empacker class', () => {
      expect(EmpackerModule.Empacker).toBeDefined();
      expect(typeof EmpackerModule.Empacker).toBe('function');
    });

    it('should export loadConfig function', () => {
      expect(EmpackerModule.loadConfig).toBeDefined();
      expect(typeof EmpackerModule.loadConfig).toBe('function');
    });

    it('should export createDefaultConfig function', () => {
      expect(EmpackerModule.createDefaultConfig).toBeDefined();
      expect(typeof EmpackerModule.createDefaultConfig).toBe('function');
    });

    it('should export mergeConfig function', () => {
      expect(EmpackerModule.mergeConfig).toBeDefined();
      expect(typeof EmpackerModule.mergeConfig).toBe('function');
    });

    it('should export utility functions', () => {
      expect(EmpackerModule.fileExists).toBeDefined();
      expect(EmpackerModule.ensureDir).toBeDefined();
      expect(EmpackerModule.formatFileSize).toBeDefined();
      expect(EmpackerModule.formatBuildTime).toBeDefined();
      expect(EmpackerModule.resolveEntries).toBeDefined();
      expect(EmpackerModule.getFileExtension).toBeDefined();
    });

    it('should export types', () => {
      // TypeScript接口在运行时不存在，但我们可以测试它们的使用
      const config: EmpackerModule.EmpackerConfig = {
        entry: 'src/index.ts'
      };
      expect(config.entry).toBe('src/index.ts');

      const result: EmpackerModule.BuildResult = {
        success: true,
        errors: [],
        warnings: [],
        outputFiles: [],
        buildTime: 100
      };
      expect(result.success).toBe(true);
    });
  });

  describe('functionality', () => {
    it('should create Empacker instance', () => {
      const empacker = new EmpackerModule.Empacker({
        entry: 'src/test.ts'
      });

      expect(empacker).toBeInstanceOf(EmpackerModule.Empacker);
    });

    it('should create default config', () => {
      const config = EmpackerModule.createDefaultConfig('js');
      
      expect(config).toContain('export default');
      expect(config).toContain('entry:');
      expect(config).toContain('outdir:');
    });

    it('should format file size', () => {
      expect(EmpackerModule.formatFileSize(1024)).toBe('1.0 KB');
      expect(EmpackerModule.formatFileSize(1024 * 1024)).toBe('1.0 MB');
    });

    it('should format build time', () => {
      expect(EmpackerModule.formatBuildTime(500)).toBe('500ms');
      expect(EmpackerModule.formatBuildTime(1500)).toBe('1.50s');
    });

    it('should get file extension', () => {
      expect(EmpackerModule.getFileExtension('file.ts')).toBe('.ts');
      expect(EmpackerModule.getFileExtension('component.tsx')).toBe('.tsx');
    });
  });
}); 