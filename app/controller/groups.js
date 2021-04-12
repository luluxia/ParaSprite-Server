'use strict';

const Controller = require('egg').Controller;

class GroupController extends Controller {
  // 创建群聊
  async create() {
    const { ctx } = this;
    await ctx.service.groups.create(ctx.request.body);
  }
  // 群聊邀请
  async invite() {
    const { ctx } = this;
    await ctx.service.groups.invite(ctx.params.id, ctx.request.body);
  }
}

module.exports = GroupController;
