'use strict';

const Controller = require('egg').Controller;

class DefaultController extends Controller {
  async setId() {
    const { ctx } = this;
    if (ctx.session.userId) {
      ctx.socket.userId = ctx.session.userId;
      console.log('set socket userid ' + ctx.socket.userId);
      ctx.socket.join('online');
      ctx.socket.emit('notice', 'success!');
    }
  }
}

module.exports = DefaultController;
