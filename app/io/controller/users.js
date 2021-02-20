'use strict';

const Controller = require('egg').Controller;

class DefaultController extends Controller {
  async setId() {
    const { ctx } = this;
    console.log('id' + ctx.session.userId);
    if (ctx.session.userId) {
      ctx.socket.userId = ctx.session.userId;
      ctx.socket.join('online');
      ctx.socket.emit('notice', 'success!');
    }
  }
}

module.exports = DefaultController;
