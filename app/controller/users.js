'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  // 登录
  async login() {
    const { ctx } = this;
    await ctx.service.users.login(ctx.request.body);
  }
  // 获取联系人信息
  async get() {
    const { ctx } = this;
    await ctx.service.users.get(ctx.session.userId);
  }
  // 获取未读消息
  async getUnread() {
    const { ctx } = this;
    await ctx.service.users.getUnread(ctx.session.userId);
  }
  // 新建用户
  async new() {
    const { ctx } = this;
    await ctx.service.users.new(ctx.request.body);
  }
  // 添加好友
  async add() {
    const { ctx } = this;
    await ctx.service.users.add(ctx.request.body);
  }
  // 好友请求反馈
  async return() {
    const { ctx } = this;
    await ctx.service.users.return(ctx.request.body);
  }
  // 搜索好友
  async search() {
    const { ctx } = this;
    await ctx.service.users.search(ctx.request.body);
  }
  // 修改用户昵称
  async edit() {
    const { ctx } = this;
    await ctx.service.users.edit(ctx.params.id, ctx.request.body);
  }
  // 修改用户个性签名
  async editSign() {
    const { ctx } = this;
    await ctx.service.users.editSign(ctx.params.id, ctx.request.body);
  }
  // 修改置顶状态
  async changeTop() {
    const { ctx } = this;
    await ctx.service.users.changeTop(ctx.params.id);
  }
  // 移出消息列表
  async remove() {
    const { ctx } = this;
    await ctx.service.users.remove(ctx.params.id);
  }
  // 移出消息列表
  async delete() {
    const { ctx } = this;
    await ctx.service.users.delete(ctx.params.id);
  }
}

module.exports = UserController;
