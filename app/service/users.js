'use strict';

const Service = require('egg').Service;
const md5 = require('md5');

class UserService extends Service {
  // 新建用户
  async new(data) {
    const { ctx } = this;
    const validation = await ctx.model.User.find({ mail: data.mail });
    if (validation.length) {
      ctx.throw(500, '该邮箱已被注册');
    } else {
      const register = await ctx.model.User.create({
        mail: data.mail,
        password: md5(data.password),
      });
      ctx.status = 200;
      ctx.body = {
        id: register._id
      }
      ctx.session.userId = register._id;
    }
  }
  // 修改单用户
  async edit(id, data) {
    const { ctx } = this;
    if (ctx.session.userId == id) {
      await ctx.model.User.findOneAndUpdate({ _id: id }, { $set: { nick: data.nick } });
      ctx.status = 200;
    } else {
      ctx.throw(500, ctx.session.userId)
    }
  }
}

module.exports = UserService;
