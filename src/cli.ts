/*
 * @Description: 命令行入口
 * @Author: MADAO
 * @Date: 2020-12-01 16:12:23
 * @LastEditors: MADAO
 * @LastEditTime: 2020-12-01 17:18:07
 */
import { program } from 'commander'
import translation from './main'

program
  .version('1.0.0')
  .name('t')
  .usage('<English>')
  .arguments('<English>')
  .action(translation)

program.parse(process.argv);