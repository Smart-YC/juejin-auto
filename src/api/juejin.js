const request = require('../utils/request');

module.exports = function () {
  return {
    /* 查询是否签到 */
    queryCheck: function (COOKIE) {
      return request({
        url: 'https://api.juejin.cn/growth_api/v1/get_today_status',
        method: 'get',
        headers: {
          cookie: COOKIE,
        },
      });
    },
    /* 查询是否签到 */
    checkCount: function (COOKIE) {
      return request({
        url: 'https://api.juejin.cn/growth_api/v1/get_counts',
        method: 'get',
        headers: {
          cookie: COOKIE,
        },
      });
    },
    /**
     * 签到
     */
    checkIn: function (COOKIE) {
      return request({
        url: 'https://api.juejin.cn/growth_api/v1/check_in',
        method: 'post',
        headers: {
          cookie: COOKIE,
        },
      });
    },
    /**
     * 抽奖
     */
    drawApi: function (COOKIE) {
      return request({
        url: 'https://api.juejin.cn/growth_api/v1/lottery/draw',
        method: 'post',
        headers: {
          cookie: COOKIE,
        },
      });
    },
    /* 幸运用户 */
    luckyApi: function (COOKIE) {
      return request({
        url: 'https://api.juejin.cn/growth_api/v1/lottery_history/global_big',
        method: 'post',
        data: { page_no: 1, page_size: 5 },
        headers: {
          cookie: COOKIE,
        }
      })
    },
    /* 沾一沾 */
    dipLucky: function (params, COOKIE) {
      return request({
        url: 'https://api.juejin.cn/growth_api/v1/lottery_lucky/dip_lucky?aid=2608',
        method: 'post',
        data: params,
        headers: {
          cookie: COOKIE,
        },
      });
    },
  }
};
