'use strict';

const Controller = require('egg').Controller;

class DefaultController extends Controller {
  async sendMsg() {
    const { ctx } = this;
    const userId = ctx.session.userId;
    const msg = ctx.args[0].msg;
    const targetId = ctx.args[0].userId;
    const time = ctx.args[0].time;
    let sendStatus = 0;
    ctx.app.io.of('/').to('online').clients((err, clients) => {
      for (const i in clients) {
        console.log(i + '  ' + clients[i] + '  ' + ctx.app.io.of('/').to('online').sockets[clients[i]].userId + '  ' + targetId);
        if (ctx.app.io.of('/').to('online').sockets[clients[i]].userId == targetId) {
          sendStatus = 1;
          console.log('send msg to ' + clients[i]);
          ctx.app.io.of('/').to('online').sockets[clients[i]].emit('getMsg', {
            id: userId,
            content: msg,
            type: 'user',
            time: time
          });
        }
      }
    })
    await ctx.model.Relationship.findOneAndUpdate({
      relationId: userId,
      userId: targetId
    }, {
      $set: {
        inChat: true,
        lastMsg: msg
      }
    })
    await ctx.model.Relationship.findOneAndUpdate({
      relationId: targetId,
      userId: userId
    }, {
      $set: {
        inChat: true,
        lastMsg: msg
      }
    })
    if (!sendStatus) {
      // TODO 消息存入数据库
    }
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
  // TODO 清空新增消息
}

module.exports = DefaultController;
