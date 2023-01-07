/**
 * Created by huangqihong on 2022/01/07 23:35:00
 */
// const dotEnv = require('dotenv');
// dotEnv.config('./env');

const { COOKIE, TOKEN, AID, UUID } = require('./utils/config.js');
const message = require('./utils/message');
const jueJinApi = require('./api/juejin')();
const miningApi = require('./api/mining')();
const bugApi = require('./api/bugFix')();
const jwt = require('jsonwebtoken');
const firstData = require('./utils/first');
let isCheckInToday = false

// 打卡
if (!COOKIE) {
  message('获取不到cookie，请检查设置')
} else {
  async function junJin() {
    try {
      // 先执行签到、抽奖以及沾喜气
      const data = await jueJinApi.queryCheck(COOKIE)
      isCheckInToday = data
      console.log('')
      console.log(`今天${isCheckInToday ? '已经完成' : '尚未进行'}签到`);
      console.log('')
      if (!isCheckInToday) {
        const luckyResult = await jueJinApi.luckyApi(COOKIE) // 幸运用户沾喜气
        const dipParams = { lottery_history_id: luckyResult.lotteries[0].history_id };
        const dipResult = await jueJinApi.dipLucky(dipParams, COOKIE);
        await jueJinApi.checkIn(); // 抽奖一次
        const drawResult = await jueJinApi.drawApi(COOKIE);
        message(`今天${isCheckInToday ? '已经完成' : '尚未进行'}签到 \n 每日免费抽奖成功 获得：${drawResult.lottery_name}; \n 
        获取幸运点${dipResult.dip_value}, 当前幸运点${dipResult.total_value + dipResult.dip_value}`);
      } else {
        const {cont_count, sum_count} = await jueJinApi.checkCount(COOKIE)
        console.log('')
        message(` 今天${isCheckInToday ? '已经完成' : '尚未进行'}签到  \n   已连续签到${cont_count}天, 签到总数${sum_count}天 `);
        console.log('')
      }
    } catch (e) {
      message(`有异常，请手动操作,${JSON.stringify(e)}`);
    }
  }
  junJin().then(() => { });
}
// 深海挖矿
let juejinUid = '';

if (!(COOKIE && TOKEN)) {
  message('获取不到游戏必须得COOKIE和TOKEN，请检查设置')
} else {
  let gameId = ''; // 发指令必须得gameId
  let deep = 0;
  let todayDiamond = 0;
  let todayLimitDiamond = 0;
  async function getInfo() {
    const time = new Date().getTime();
    console.log(todayDiamond, todayLimitDiamond);
    const userInfo = await miningApi.getUser(COOKIE);
    juejinUid = userInfo.user_id;

    const resInfo = await miningApi.getInfo(juejinUid, time, TOKEN);
    deep = resInfo.gameInfo ? resInfo.gameInfo.deep : 0;
    gameId = resInfo.gameInfo ? resInfo.gameInfo.gameId : 0;
    todayDiamond = resInfo.userInfo.todayDiamond || 0;
    todayLimitDiamond = resInfo.userInfo.todayLimitDiamond;
    return Promise.resolve(resInfo);
  }
  getInfo().then(() => {
    if (todayDiamond <= todayLimitDiamond) {
      playGame().then(() => {});
    }
  });

  // 暂停，避免快速请求以及频繁请求
  async function sleep(delay) {
    return new Promise(((resolve) => setTimeout(resolve, delay)));
  }
  /**
   * 循环游戏
   */
  async function playGame() {
    try {
      // 开始
      const startTime = new Date().getTime();
      const startParams = {
        roleId: 3,
      };
      const startData = await miningApi.start(startParams, juejinUid, startTime, TOKEN);
      await sleep(3000);
      console.log('startData', startData);
      gameId = startData.gameId;
      // 发起指令
      const commandTime = +new Date().getTime();
      const commandParams = {
        command: firstData.command,
      };
      const xGameId = getXGameId(gameId);
      const commandData = await miningApi.command(commandParams, juejinUid, commandTime, xGameId, TOKEN);
      deep = commandData.curPos.y;
      await sleep(3000);
      console.log('commandData', commandData);
      // 结束
      const overTime = +new Date().getTime();
      const overParams = {
        isButton: 1,
      };
      const overData = await miningApi.over(overParams, juejinUid, overTime, TOKEN);
      await sleep(3000);
      console.log('overData', overData);
      deep = overData.deep;
      // 更换地图
      const mapTime = +new Date().getTime();
      if (deep < 500) {
        await sleep(3000);
        await miningApi.freshMap({}, juejinUid, mapTime, TOKEN);
      }
      await sleep(3000);
      await getInfo().then((res) => {
        if (todayDiamond < todayLimitDiamond) {
          playGame()
        } else {
          message(`今日限制矿石${res.userInfo.todayLimitDiamond},已获取矿石${res.userInfo.todayDiamond}`)
        }
      });
    } catch(e) {
      console.log(e);
      await sleep(3000);
      // 结束
      const overTime = +new Date().getTime();
      const overParams = {
        isButton: 1,
      };
      await miningApi.over(overParams, juejinUid, overTime, TOKEN);
      await sleep(3000);
      await getInfo().then((res) => {
        if (todayDiamond < todayLimitDiamond) {
          playGame()
        } else {
          message(`今日限制矿石${res.userInfo.todayLimitDiamond},已获取矿石${res.userInfo.todayDiamond}`)
        }
      });
    }
  }
  function getXGameId(id) {
    const time = +new Date().getTime();
    return jwt.sign(
      {
        gameId: id,
        time: time,
        // eslint-disable-next-line max-len
      },
      "-----BEGIN EC PARAMETERS-----\nBggqhkjOPQMBBw==\n-----END EC PARAMETERS-----\n-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIDB7KMVQd+eeKt7AwDMMUaT7DE3Sl0Mto3LEojnEkRiAoAoGCCqGSM49\nAwEHoUQDQgAEEkViJDU8lYJUenS6IxPlvFJtUCDNF0c/F/cX07KCweC4Q/nOKsoU\nnYJsb4O8lMqNXaI1j16OmXk9CkcQQXbzfg==\n-----END EC PRIVATE KEY-----\n",
      {
        algorithm: "ES256",
        expiresIn: 2592e3,
        header: {
          alg: "ES256",
          typ: "JWT",
        },
      }
    );
  }
}
// 修复bug
async function bugs() {
  let desp = ''
  // 查询bug数量
  const res_bugList = await bugApi.getBugList(AID, UUID, COOKIE)
  if (res_bugList.length) {
    // 收集bug
    const res_collectBugByList = await bugApi.collectBugByList(AID, UUID, COOKIE, res_bugList)
    if (res_collectBugByList.err_no == 1001) {
      desp = `收集${res_bugList.length}个bug成功;`
    } else {
      desp = '收集bug失败'
    }
  }
  // 参与活动
  const res_joinBugFix = await bugApi.joinBugFix(AID, UUID, COOKIE)
  desp += "love bugfix 参与成功"
  message(desp)
}
bugs()





