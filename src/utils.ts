import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

/**
 * 检查文件是否存在
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * 确保目录存在
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

/**
 * 解析入口文件
 */
export async function resolveEntries(entry: string | string[]): Promise<string[]> {
  const entries = Array.isArray(entry) ? entry : [entry];
  const resolvedEntries: string[] = [];

  for (const entryPattern of entries) {
    if (entryPattern.includes('*')) {
      // 处理 glob 模式
      const files = await glob(entryPattern);
      resolvedEntries.push(...files);
    } else {
      resolvedEntries.push(entryPattern);
    }
  }

  return resolvedEntries;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * 格式化构建时间
 */
export function formatBuildTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else {
    return `${(milliseconds / 1000).toFixed(2)}s`;
  }
} 