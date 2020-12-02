/*
 * @Description: 翻译相关方法
 * @Author: MADAO
 * @Date: 2020-12-01 16:33:20
 * @LastEditors: MADAO
 * @LastEditTime: 2020-12-02 09:58:12
 */

import * as http from 'https'
import * as querystring from 'querystring'
import { appID, secretKey } from './private'

const md5 = require('md5')
const ora = require('ora')


const getParams = (word: string) => {
  const salt = Math.random()
  const sign = md5(`${appID}${word}${salt}${secretKey}`)
  const params = querystring.stringify({
    q: word,
    from: 'en',
    to: 'zh',
    appid: appID,
    salt,
    sign
  })
  return params
}
const getErrorMessages = (errorCode: string) => {
  const errorMessage: { [key: string]: string[] }= {
    52001: ['请求超时','重试'],
    52002: ['系统错误','重试'],
    52003: ['未授权用户', '请检查您的appid是否正确，或者服务是否开通'],
    54000: ['必填参数为空','请检查是否少传参数'],
    54001: ['签名错误', '请检查您的签名生成方法'],
    54003: ['访问频率受限', '请降低您的调用频率，或进行身份认证后切换为高级版/尊享版'],
    54004: ['账户余额不足', '请前往管理控制台为账户充值'],
    54005: ['长query请求频繁', '请降低长query的发送频率，3s后再试'],
    58000: ['客户端IP非法','检查个人资料里填写的IP地址是否正确，可前往开发者信息-基本信息修改，可前往开发者信息-基本信息修改'],
    58001: ['译文语言方向不支持', '检查译文语言是否在语言列表里'],
    58002: ['服务当前已关闭', '请前往管理控制台开启服务'],
    90107: ['认证未通过或未生效', '请前往我的认证查看认证进度']
  }
  return errorMessage[errorCode] || ['出错了', '请稍后重试']
}
const loading = ora()
const translation = (word: string) => {
  loading.start('loading')
  const params = getParams(word)
  const request = http.request({
    host: 'fanyi-api.baidu.com',
    path: `/api/trans/vip/translate?${params}`,
    port: 443,
    method: 'GET'
  }, (response) => {
    let chunks = ''
    response.on('data', (chunk: Buffer) => {
      chunks += chunk.toString()
    })
    response.on('end', () => {
      const result = JSON.parse(chunks)
      if (result.error_code) {
        const errorMessages = getErrorMessages(result.error_code)
        loading.fail(`${errorMessages[0]}`)
        loading.info(`${errorMessages[1]}`)
      } else {
        loading.succeed(`${result.trans_result[0].dst}`)
      }
      process.exit(0)
    })
  })

  request.on('error', (error) => {
    loading.fail(error.message)
    process.exit(0)
  })

  request.end()
}

export default translation