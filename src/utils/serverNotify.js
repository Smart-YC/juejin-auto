/*
 * @Author: songyingchun
 * @Date: 2022-04-14 18:05:16
 * @Description: 
 */

const axios = require('axios');

function send({ openid, title, desc }) {
  return new Promise((resolve, reject) => {

    console.log(openid, title, desc);
    const option = {
      url: `https://send-wx-message-1gv7v5ge01556012-1259694301.ap-guangzhou.app.tcloudbase.com/express-starter/sendMessage`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        openid,
        title,
        desc,
      },
    };
    axios(option).then((res) => {
      resolve();
      console.log('发送成功');
    }, (err) => {
      reject(err)
    });
  });
}

const config = require('./config.js');

let msg = '';
module.exports = function bot(message) {
  if(config.OPENID) {
    msg += message + '\n';
    send({
      openid: config.OPENID, // 企业 ID
      title: '掘金自动打卡通知', // title
      desc: msg, // desp
    }).catch((error) => {
      console.log(`发送失败 => ${error}`);
    });
  }
};
