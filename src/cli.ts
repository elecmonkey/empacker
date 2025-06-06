#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { Empacker } from './bundler';
import { loadConfig, createDefaultConfig, mergeConfig } from './config';
import { EmpackerConfig } from './types';

const program = new Command();

program
  .name('empacker')
  .description('A fast JavaScript/TypeScript library bundler powered by esbuild')
  .version('1.0.0');

// 构建命令
program
  .command('build')
  .description('构建项目')
  .option('-c, --config <config>', '配置文件路径')
  .option('-e, --entry <entry>', '入口文件')
  .option('-o, --outdir <outdir>', '输出目录')
  .option('--outfile <outfile>', '输出文件名')
  .option('-f, --format <format>', '输出格式 (cjs|esm|iife)', 'esm')
  .option('--bundle', '打包成单个文件')
  .option('--no-bundle', '不打包，保持文件结构')
  .option('--sourcemap', '生成 source map')
  .option('--no-sourcemap', '不生成 source map')
  .option('--minify', '压缩代码')
  .option('--no-minify', '不压缩代码')
  .option('--dts', '生成 TypeScript 声明文件')
  .option('--external <external...>', '外部依赖')
  .action(async (options) => {
    try {
      // 加载配置文件
      let config = await loadConfig(options.config);
      
      if (!config && !options.entry) {
        console.log(chalk.red('❌ 没有找到配置文件，且未指定入口文件'));
        console.log(chalk.yellow('💡 请使用 empacker init 创建配置文件，或使用 -e 参数指定入口文件'));
        process.exit(1);
      }

      // 从命令行参数构建配置
      const cliConfig: Partial<EmpackerConfig> = {};
      if (options.entry) cliConfig.entry = options.entry;
      if (options.outdir) cliConfig.outdir = options.outdir;
      if (options.outfile) cliConfig.outfile = options.outfile;
      if (options.format) cliConfig.format = options.format;
      if (options.bundle !== undefined) cliConfig.bundle = options.bundle;
      if (options.sourcemap !== undefined) cliConfig.sourcemap = options.sourcemap;
      if (options.minify !== undefined) cliConfig.minify = options.minify;
      if (options.dts !== undefined) cliConfig.dts = options.dts;
      if (options.external) cliConfig.external = options.external;

      // 合并配置
      const finalConfig = config ? mergeConfig(config, cliConfig) : cliConfig as EmpackerConfig;

      // 创建打包器实例并构建
      const bundler = new Empacker(finalConfig);
      const result = await bundler.build();

      if (!result.success) {
        process.exit(1);
      }
    } catch (error) {
      console.log(chalk.red('❌ 构建失败:'));
      console.log(chalk.red(`   ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// 监听命令
program
  .command('watch')
  .description('监听文件变化并自动构建')
  .option('-c, --config <config>', '配置文件路径')
  .option('-e, --entry <entry>', '入口文件')
  .option('-o, --outdir <outdir>', '输出目录')
  .option('--outfile <outfile>', '输出文件名')
  .option('-f, --format <format>', '输出格式 (cjs|esm|iife)', 'esm')
  .option('--bundle', '打包成单个文件')
  .option('--no-bundle', '不打包，保持文件结构')
  .option('--sourcemap', '生成 source map')
  .option('--no-sourcemap', '不生成 source map')
  .option('--minify', '压缩代码')
  .option('--no-minify', '不压缩代码')
  .option('--dts', '生成 TypeScript 声明文件')
  .option('--external <external...>', '外部依赖')
  .action(async (options) => {
    try {
      // 加载配置文件
      let config = await loadConfig(options.config);
      
      if (!config && !options.entry) {
        console.log(chalk.red('❌ 没有找到配置文件，且未指定入口文件'));
        console.log(chalk.yellow('💡 请使用 empacker init 创建配置文件，或使用 -e 参数指定入口文件'));
        process.exit(1);
      }

      // 从命令行参数构建配置
      const cliConfig: Partial<EmpackerConfig> = { watch: true };
      if (options.entry) cliConfig.entry = options.entry;
      if (options.outdir) cliConfig.outdir = options.outdir;
      if (options.outfile) cliConfig.outfile = options.outfile;
      if (options.format) cliConfig.format = options.format;
      if (options.bundle !== undefined) cliConfig.bundle = options.bundle;
      if (options.sourcemap !== undefined) cliConfig.sourcemap = options.sourcemap;
      if (options.minify !== undefined) cliConfig.minify = options.minify;
      if (options.dts !== undefined) cliConfig.dts = options.dts;
      if (options.external) cliConfig.external = options.external;

      // 合并配置
      const finalConfig = config ? mergeConfig(config, cliConfig) : cliConfig as EmpackerConfig;

      // 创建打包器实例并启动监听
      const bundler = new Empacker(finalConfig);
      await bundler.watch();
    } catch (error) {
      console.log(chalk.red('❌ 监听启动失败:'));
      console.log(chalk.red(`   ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// 初始化命令
program
  .command('init')
  .description('创建配置文件')
  .option('-f, --format <format>', '配置文件格式 (js|ts|json)', 'js')
  .action(async (options) => {
    try {
      const format = options.format as 'js' | 'ts' | 'json';
      const configFileName = `empacker.config.${format}`;
      const configPath = path.resolve(process.cwd(), configFileName);

      if (fs.existsSync(configPath)) {
        console.log(chalk.yellow(`⚠️  配置文件 ${configFileName} 已存在`));
        return;
      }

      const configContent = createDefaultConfig(format);
      fs.writeFileSync(configPath, configContent);

      console.log(chalk.green(`✅ 创建配置文件: ${configFileName}`));
      console.log(chalk.blue('💡 你可以编辑配置文件来自定义构建选项'));
    } catch (error) {
      console.log(chalk.red('❌ 创建配置文件失败:'));
      console.log(chalk.red(`   ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// 解析命令行参数
program.parse(); 