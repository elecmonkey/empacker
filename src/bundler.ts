import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';
import { EmpackerConfig, EmpackerTaskConfig, BuildResult, MultiBuildResult } from './types.js';
import { resolveEntries, ensureDir, formatFileSize, formatBuildTime, fileExists } from './utils.js';

export class Empacker {
  private config: Required<EmpackerConfig>;

  constructor(config: EmpackerConfig) {
    this.config = this.normalizeConfig(config);
  }

  /**
   * 标准化配置
   */
  private normalizeConfig(config: EmpackerConfig): Required<EmpackerConfig> {
    const normalized: Required<EmpackerConfig> = {
      name: config.name || '',
      entry: config.entry || '',
      outdir: config.outdir || 'dist',
      outfile: config.outfile || '',
      format: config.format || 'esm',
      bundle: config.bundle ?? true,
      sourcemap: config.sourcemap ?? false,
      minify: config.minify ?? true,
      external: config.external || [],
      watch: config.watch ?? false,
      dts: config.dts ?? false,
      esbuildOptions: config.esbuildOptions || {},
      tasks: config.tasks || []
    };

    // 验证配置
    if (!normalized.entry && (!normalized.tasks || normalized.tasks.length === 0)) {
      throw new Error('Entry 配置或 tasks 配置是必需的');
    }

    return normalized;
  }

  /**
   * 标准化单个任务配置
   */
  private normalizeTaskConfig(task: EmpackerTaskConfig, baseConfig: Required<EmpackerConfig>): Required<EmpackerTaskConfig> {
    return {
      name: task.name || 'unnamed',
      entry: task.entry,
      outdir: task.outdir || baseConfig.outdir,
      outfile: task.outfile || baseConfig.outfile,
      format: task.format || baseConfig.format,
      bundle: task.bundle ?? baseConfig.bundle,
      sourcemap: task.sourcemap ?? baseConfig.sourcemap,
      minify: task.minify ?? baseConfig.minify,
      external: [...(baseConfig.external || []), ...(task.external || [])],
      watch: task.watch ?? baseConfig.watch,
      dts: task.dts ?? baseConfig.dts,
      esbuildOptions: { ...baseConfig.esbuildOptions, ...task.esbuildOptions }
    };
  }

  /**
   * 判断是否为多任务配置
   */
  private isMultiTask(): boolean {
    return this.config.tasks && this.config.tasks.length > 0;
  }

  /**
   * 构建多个任务
   */
  async buildTasks(): Promise<MultiBuildResult> {
    const startTime = Date.now();
    const results: (BuildResult & { taskName?: string })[] = [];
    let allSuccess = true;

    console.log(chalk.blue('🚀 开始多任务构建...'));

    for (const task of this.config.tasks) {
      const normalizedTask = this.normalizeTaskConfig(task, this.config);
      const taskName = normalizedTask.name;
      
      console.log(chalk.cyan(`\n📦 构建任务: ${taskName}`));
      
      try {
        const taskBundler = new Empacker(normalizedTask);
        const result = await taskBundler.buildSingle();
        results.push({ ...result, taskName });
        
        if (!result.success) {
          allSuccess = false;
        }
      } catch (error) {
        const errorResult: BuildResult & { taskName?: string } = {
          success: false,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
          outputFiles: [],
          buildTime: 0,
          taskName
        };
        results.push(errorResult);
        allSuccess = false;
        
        console.log(chalk.red(`❌ 任务 ${taskName} 构建失败:`));
        console.log(chalk.red(`   ${errorResult.errors[0]}`));
      }
    }

    const totalBuildTime = Date.now() - startTime;
    
    if (allSuccess) {
      console.log(chalk.green('\n✅ 所有任务构建完成!'));
    } else {
      console.log(chalk.red('\n❌ 部分任务构建失败'));
    }
    
    console.log(chalk.blue(`⏱️  总构建时间: ${formatBuildTime(totalBuildTime)}`));

    return {
      success: allSuccess,
      results,
      totalBuildTime
    };
  }

  /**
   * 单任务构建（重命名原来的 build 方法）
   */
  async buildSingle(): Promise<BuildResult> {
    const startTime = Date.now();
    const result: BuildResult = {
      success: false,
      errors: [],
      warnings: [],
      outputFiles: [],
      buildTime: 0
    };

    try {
      if (!this.isMultiTask()) {
        console.log(chalk.blue('🚀 开始构建...'));
      }

      // 解析入口文件
      const entries = await resolveEntries(this.config.entry);
      
      if (entries.length === 0) {
        throw new Error('没有找到匹配的入口文件');
      }

      // 验证入口文件存在
      for (const entry of entries) {
        if (!fileExists(entry)) {
          throw new Error(`入口文件不存在: ${entry}`);
        }
      }

      // 确保输出目录存在
      if (this.config.outdir && !this.config.outfile) {
        ensureDir(this.config.outdir);
      } else if (this.config.outfile) {
        ensureDir(path.dirname(this.config.outfile));
      }

      // 构建 esbuild 配置
      const buildOptions: esbuild.BuildOptions = {
        entryPoints: entries,
        bundle: this.config.bundle,
        platform: 'node',
        target: 'node16',
        format: this.config.format === 'cjs' ? 'cjs' : 
                this.config.format === 'esm' ? 'esm' : 'iife',
        sourcemap: this.config.sourcemap,
        minify: this.config.minify,
        external: this.config.external,
        metafile: true,
        write: true,
        ...this.config.esbuildOptions
      };

      // 设置输出配置
      if (this.config.outfile) {
        buildOptions.outfile = this.config.outfile;
        if (this.config.outdir && !this.isMultiTask()) {
          console.log(chalk.yellow('警告: 同时指定了 outfile 和 outdir，将使用 outfile'));
        }
      } else {
        buildOptions.outdir = this.config.outdir;
      }

      // 执行构建
      const buildResult = await esbuild.build(buildOptions);

      // 处理警告
      if (buildResult.warnings.length > 0) {
        result.warnings = buildResult.warnings.map(w => w.text);
        if (!this.isMultiTask()) {
          console.log(chalk.yellow(`⚠️  ${result.warnings.length} 个警告:`));
          result.warnings.forEach(warning => {
            console.log(chalk.yellow(`   ${warning}`));
          });
        }
      }

      // 获取输出文件信息
      if (buildResult.metafile) {
        const outputs = Object.keys(buildResult.metafile.outputs);
        result.outputFiles = outputs;

        if (!this.isMultiTask()) {
          console.log(chalk.green('✅ 构建成功!'));
          console.log(chalk.green('📦 输出文件:'));
          
          for (const output of outputs) {
            const stats = fs.statSync(output);
            const size = formatFileSize(stats.size);
            console.log(chalk.green(`   ${output} (${size})`));
          }
        } else {
          // 多任务模式下简化输出
          const totalSize = outputs.reduce((acc, output) => {
            const stats = fs.statSync(output);
            return acc + stats.size;
          }, 0);
          console.log(chalk.green(`   ✅ 成功 (${outputs.length} 个文件, ${formatFileSize(totalSize)})`));
        }
      }

      // 生成 TypeScript 声明文件
      await this.generateDts();

      result.success = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(errorMessage);
      if (!this.isMultiTask()) {
        console.log(chalk.red('❌ 构建失败:'));
        console.log(chalk.red(`   ${errorMessage}`));
      } else {
        console.log(chalk.red(`   ❌ 失败: ${errorMessage}`));
      }
    }

    result.buildTime = Date.now() - startTime;
    if (!this.isMultiTask()) {
      console.log(chalk.blue(`⏱️  构建时间: ${formatBuildTime(result.buildTime)}`));
    }

    return result;
  }

  /**
   * 构建项目（支持单任务和多任务）
   */
  async build(): Promise<BuildResult | MultiBuildResult> {
    if (this.isMultiTask()) {
      return await this.buildTasks();
    } else {
      return await this.buildSingle();
    }
  }

  /**
   * 生成 TypeScript 声明文件
   */
  private async generateDts(): Promise<void> {
    if (!this.config.dts) return;

    if (!this.isMultiTask()) {
      console.log(chalk.blue('📝 生成 TypeScript 声明文件...'));
    }

    try {
      // 创建临时的 tsconfig 用于生成声明文件
      const tempTsConfig = {
        compilerOptions: {
          target: "ES2020",
          module: "ES2020",
          moduleResolution: "node",
          outDir: this.config.outdir,
          rootDir: "./src",
          declaration: true,
          emitDeclarationOnly: true,
          skipLibCheck: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist", "dist-tsc"]
      };

      const tempConfigPath = 'tsconfig.temp.json';
      fs.writeFileSync(tempConfigPath, JSON.stringify(tempTsConfig, null, 2));

      // 运行 tsc 生成声明文件
      await new Promise((resolve, reject) => {
        const tscProcess = spawn('npx', ['tsc', '-p', tempConfigPath]);

        tscProcess.stdout.on('data', (data) => {
          if (!this.isMultiTask()) {
            console.log(data.toString());
          }
        });

        tscProcess.stderr.on('data', (data) => {
          if (!this.isMultiTask()) {
            console.error(data.toString());
          }
        });

        tscProcess.on('close', (code) => {
          if (code === 0) {
            resolve(undefined);
          } else {
            reject(new Error(`tsc 进程退出码: ${code}`));
          }
        });
      });

      // 清理临时配置文件
      fs.unlinkSync(tempConfigPath);

      if (!this.isMultiTask()) {
        console.log(chalk.green('✅ TypeScript 声明文件生成完成'));
      }
    } catch (error) {
      if (!this.isMultiTask()) {
        console.log(chalk.yellow(`⚠️  声明文件生成失败: ${error instanceof Error ? error.message : String(error)}`));
      }
    }
  }

  /**
   * 监听模式构建
   */
  async watch(): Promise<void> {
    if (this.isMultiTask()) {
      console.log(chalk.red('❌ 监听模式暂不支持多任务配置'));
      throw new Error('监听模式暂不支持多任务配置');
    }

    console.log(chalk.blue('👀 启动监听模式...'));

    try {
      const entries = await resolveEntries(this.config.entry);
      
      const buildOptions: esbuild.BuildOptions = {
        entryPoints: entries,
        bundle: this.config.bundle,
        platform: 'node',
        target: 'node16',
        format: this.config.format === 'cjs' ? 'cjs' : 
                this.config.format === 'esm' ? 'esm' : 'iife',
        sourcemap: this.config.sourcemap,
        minify: this.config.minify,
        external: this.config.external,
        write: true,
        ...this.config.esbuildOptions
      };

      if (this.config.outfile) {
        buildOptions.outfile = this.config.outfile;
      } else {
        buildOptions.outdir = this.config.outdir;
      }

      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();

      console.log(chalk.green('🎯 监听已启动，文件变化时将自动重新构建...'));
      console.log(chalk.gray('按 Ctrl+C 停止监听'));

      // 保持进程运行
      process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n🛑 停止监听...'));
        await ctx.dispose();
        process.exit(0);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(chalk.red('❌ 监听启动失败:'));
      console.log(chalk.red(`   ${errorMessage}`));
      throw error;
    }
  }
} 