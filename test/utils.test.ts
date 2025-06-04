import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  fileExists,
  ensureDir,
  getFileExtension,
  resolveEntries,
  formatFileSize,
  formatBuildTime
} from '../src/utils';

describe('Utils', () => {
  const testDir = 'test-temp';
  const testFile = path.join(testDir, 'test.txt');

  beforeEach(() => {
    // 清理测试环境
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // 清理测试环境
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('fileExists', () => {
    it('should return true for existing file', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(testFile, 'test content');
      
      expect(fileExists(testFile)).toBe(true);
    });

    it('should return false for non-existing file', () => {
      expect(fileExists('non-existing-file.txt')).toBe(false);
    });

    it('should return false for directory', () => {
      fs.mkdirSync(testDir, { recursive: true });
      
      expect(fileExists(testDir)).toBe(false);
    });
  });

  describe('ensureDir', () => {
    it('should create directory if it does not exist', () => {
      expect(fs.existsSync(testDir)).toBe(false);
      
      ensureDir(testDir);
      
      expect(fs.existsSync(testDir)).toBe(true);
      expect(fs.statSync(testDir).isDirectory()).toBe(true);
    });

    it('should not throw error if directory already exists', () => {
      fs.mkdirSync(testDir, { recursive: true });
      
      expect(() => ensureDir(testDir)).not.toThrow();
    });

    it('should create nested directories', () => {
      const nestedDir = path.join(testDir, 'nested', 'deep');
      
      ensureDir(nestedDir);
      
      expect(fs.existsSync(nestedDir)).toBe(true);
    });
  });

  describe('getFileExtension', () => {
    it('should return correct extension for various files', () => {
      expect(getFileExtension('file.txt')).toBe('.txt');
      expect(getFileExtension('script.js')).toBe('.js');
      expect(getFileExtension('component.tsx')).toBe('.tsx');
      expect(getFileExtension('style.css')).toBe('.css');
    });

    it('should return lowercase extension', () => {
      expect(getFileExtension('FILE.TXT')).toBe('.txt');
      expect(getFileExtension('Script.JS')).toBe('.js');
    });

    it('should handle files without extension', () => {
      expect(getFileExtension('README')).toBe('');
      expect(getFileExtension('Dockerfile')).toBe('');
    });

    it('should handle paths with directories', () => {
      expect(getFileExtension('/path/to/file.js')).toBe('.js');
      expect(getFileExtension('./src/index.ts')).toBe('.ts');
    });
  });

  describe('resolveEntries', () => {
    beforeEach(() => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.mkdirSync(path.join(testDir, 'sub'), { recursive: true });
      fs.writeFileSync(path.join(testDir, 'file1.ts'), '');
      fs.writeFileSync(path.join(testDir, 'file2.js'), '');
      fs.writeFileSync(path.join(testDir, 'sub', 'file3.ts'), '');
    });

    it('should resolve single entry', async () => {
      const result = await resolveEntries(path.join(testDir, 'file1.ts'));
      expect(result).toEqual([path.join(testDir, 'file1.ts')]);
    });

    it('should resolve multiple entries', async () => {
      const entries = [
        path.join(testDir, 'file1.ts'),
        path.join(testDir, 'file2.js')
      ];
      const result = await resolveEntries(entries);
      expect(result).toEqual(entries);
    });

    it('should resolve glob patterns', async () => {
      const result = await resolveEntries(path.join(testDir, '*.ts'));
      expect(result).toContain(path.join(testDir, 'file1.ts'));
      expect(result).not.toContain(path.join(testDir, 'file2.js'));
    });

    it('should resolve recursive glob patterns', async () => {
      const result = await resolveEntries(path.join(testDir, '**/*.ts'));
      expect(result).toContain(path.join(testDir, 'file1.ts'));
      expect(result).toContain(path.join(testDir, 'sub', 'file3.ts'));
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('should format KB correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 1023)).toBe('1023.0 KB');
    });

    it('should format MB correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
    });

    it('should format GB correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
      expect(formatFileSize(1024 * 1024 * 1024 * 1.5)).toBe('1.5 GB');
    });
  });

  describe('formatBuildTime', () => {
    it('should format milliseconds for values under 1000ms', () => {
      expect(formatBuildTime(0)).toBe('0ms');
      expect(formatBuildTime(123)).toBe('123ms');
      expect(formatBuildTime(999)).toBe('999ms');
    });

    it('should format seconds for values 1000ms and above', () => {
      expect(formatBuildTime(1000)).toBe('1.00s');
      expect(formatBuildTime(1500)).toBe('1.50s');
      expect(formatBuildTime(2345)).toBe('2.35s');
      expect(formatBuildTime(10000)).toBe('10.00s');
    });
  });
}); 