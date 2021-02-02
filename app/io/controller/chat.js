'use strict';

const Controller = require('egg').Controller;

class DefaultController extends Controller {
  async index() {
    console.log('get');
    const { ctx } = this;
    const message = ctx.args[0];
    await ctx.socket.emit('res', `Hi! I've got your message: ${message}`);
  }
}

module.exports = DefaultController;
