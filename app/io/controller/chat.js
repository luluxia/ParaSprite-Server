'use strict';

const Controller = require('egg').Controller;

class DefaultController extends Controller {
  async sendMsg() {
    const { ctx } = this;
    const msg = ctx.args[0].msg;
    const userId = ctx.session.userId;
    const targetId = ctx.args[0].userId;
    let sendStatus = 0;
    ctx.app.io.of('/').to('online').clients((err, clients) => {
      for (const i in clients) {
        console.log(i + '  ' + clients[i] + '  ' + ctx.app.io.of('/').to('online').sockets[clients[i]].userId + '  ' + targetId);
        if (ctx.app.io.of('/').to('online').sockets[clients[i]].userId == targetId) {
          sendStatus = 1;
          console.log('send msg to ' + clients[i]);
          ctx.app.io.of('/').to('online').sockets[clients[i]].emit('getMsg', {
            userId: userId,
            msg: msg
          });
        }
      }
    })
    if (!sendStatus) {

    }
    ctx.socket.emit('res', `Hi! I've got your message: ${ctx.args[0].msg}`);
  }
}

module.exports = DefaultController;
