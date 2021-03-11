'use strict';

const Controller = require('egg').Controller;

class DefaultController extends Controller {
  async sendMsg() {
    const { ctx } = this;
    const userId = ctx.session.userId;
    const msg = ctx.args[0].msg;
    const targetId = ctx.args[0].userId;
    const time = ctx.args[0].time;
    // 查找socket连接
    const targetSocketId = (await ctx.model.User.findOne({ _id: targetId })).socketId;
    const sendContent = {
      id: userId,
      content: msg,
      type: 'user',
      time: String(time)
    }
    if (targetSocketId) {
      ctx.app.io.of('/').to('online').sockets[targetSocketId].emit('getMsg', sendContent);
    } else {
      // TODO 未读消息存入数据库
      ctx.model.Message.create({
        to: targetId,
        type: 'msg',
        content: sendContent
      })
    }
    // 修改关系状态
    await ctx.model.Relationship.findOneAndUpdate({
      relationId: userId,
      userId: targetId
    }, {
      $set: {
        inChat: true,
        lastMsg: msg,
        lastActiveTime: time
      }
    })
    await ctx.model.Relationship.findOneAndUpdate({
      relationId: targetId,
      userId: userId
    }, {
      $set: {
        inChat: true,
        lastMsg: msg,
        lastActiveTime: time
      }
    })
    ctx.socket.emit('res', `Hi! I've got your message: ${ctx.args[0].msg}`);
  }
  // 设置新增消息
  async addLastMsgNum() {
    const { ctx } = this;
    const userId = ctx.session.userId;
    const targetId = ctx.args[0].id;
    await ctx.model.Relationship.findOneAndUpdate({
      relationId: targetId,
      userId: userId
    }, {
      $inc: {
        lastMsgNum: 1
      }
    })
  }
  // 清空新增消息
  async clearLastMsgNum() {
    const { ctx } = this;
    const userId = ctx.session.userId;
    const targetId = ctx.args[0].id;
    await ctx.model.Relationship.findOneAndUpdate({
      relationId: targetId,
      userId: userId
    }, {
      $set: {
        lastMsgNum: 0
      }
    })
  }
}

module.exports = DefaultController;
