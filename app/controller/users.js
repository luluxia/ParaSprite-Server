'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  // 新建用户
  async new() {
    const { ctx } = this;
    await ctx.service.users.new(ctx.request.body);
  }
  // 修改单用户
  async edit() {
    const { ctx } = this;
    await ctx.service.users.edit(ctx.params.id, ctx.request.body);
  }
}

module.exports = UserController;
