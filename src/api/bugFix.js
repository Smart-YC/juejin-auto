/*
 * @Author: songyingchun
 * @Date: 2023-01-07 10:22:47
 * @Description: 
 */
const request = require('../utils/request');

module.exports = function () {
    return {
        /* 查询用户可收集bug数 */
        getBugList: async function (aid, uuid, COOKIE) {
            return request({
                url: `https://api.juejin.cn/user_api/v1/bugfix/not_collect?aid=${aid}&uuid=${uuid}`,
                method: 'post',
                headers: {
                    cookie: COOKIE,
                },
            });
        },
        /* 收集bug */
        collectBug: async function (aid, uuid, COOKIE, params) {
            return request({
                url: `https://api.juejin.cn/user_api/v1/bugfix/collect?aid=${aid}&uuid=${uuid}`,
                method: 'post',
                data: params,
                headers: {
                    cookie: COOKIE,
                },
            });
        },
        /* 获取活动详情 */
        getBugFixGameInfo: async function (aid, uuid, COOKIE) {
            return request({
                url: `https://api.juejin.cn/user_api/v1/bugfix/competition?aid=${aid}&uuid=${uuid}`,
                method: 'post',
                headers: {
                    cookie: COOKIE,
                },
            });
        },
        /* 获取活动用户详情:可用Bug数量 */
        getBugFixGameUserInfo: async function (aid, uuid, COOKIE, params) {
            return request({
                url: `https://api.juejin.cn/user_api/v1/bugfix/user?aid=${aid}&uuid=${uuid}`,
                method: 'post',
                data: params,
                headers: {
                    cookie: COOKIE,
                },
            });
        },
        /* 参与活动 */
        getBugFixGameUserInfo: async function (aid, uuid, COOKIE, params) {
            return request({
                url: `https://api.juejin.cn/user_api/v1/bugfix/fix?aid=${aid}&uuid=${uuid}`,
                method: 'post',
                data: params,
                headers: {
                    cookie: COOKIE,
                },
            });
        },
        /* 根据列表收取Bug */
        collectBugByList: async function (aid, uuid, COOKIE, bugList) {
            let err_msg = ""
            let err_no = 0
            for (let j = 0; j < bugList.length; j++) {
                const params = {
                    bug_time: bugList[j].bug_time,
                    bug_type: bugList[j].bug_type
                }
                let res_collectBug = await this.collectBug(aid, uuid, COOKIE, params)

                if (!res_collectBug) {
                    err_no = 1001
                    err_msg += `收集bug成功`
                }
            }
            return {
                err_no: err_no,
                err_msg: err_msg
            }
        },
        /* 参与游戏 */
        joinBugFix: async function (aid, uuid, cookie) {
            let msg = ""
            const res_bugFixGameInfo = await this.getBugFixGameInfo(aid, uuid, cookie)
            msg = res_bugFixGameInfo.err_msg
            if (res_bugFixGameInfo.err_no == 0 && res_bugFixGameInfo.data.award_status == 1) {
                // 活动进行中
                const res_bugFixGameUserInfo = await this.getBugFixGameUserInfo(aid, uuid, cookie, { competition_id: res_bugFixGameInfo.data.competition_id })
                // 用户已参与的bug数：bug_fix_num
                // 用户剩余的bug数：user_own_bug
                const bug_fix_num = res_bugFixGameUserInfo.data.bug_fix_num
                const user_own_bug = res_bugFixGameUserInfo.data.user_own_bug
                if (bug_fix_num < 10 && user_own_bug >= 10) {
                    const res_bugFix = await this.bugFix(aid, uuid, cookie, { competition_id: res_bugFixGameInfo.data.competition_id })
                    if (res_bugFix.err_no == 0) {
                        return {
                            err_no: 0,
                            err_msg: res_bugFixGameInfo.data.competition_name
                        }
                    }
                    msg = res_bugFix.err_msg
                }

            } else if (res_bugFixGameInfo.err_no == 0 && res_bugFixGameInfo.data.award_status == 0) {
                msg = "活动已结束"
            }
            return {
                err_no: 1001,
                err_msg: msg
            }
        }
    }
}