'use strict';

const Service = require('egg').Service;
const md5 = require('md5');

class UserService extends Service {
  async register(params) {
    const { ctx } = this;
    const validation = await ctx.model.User.find({ mail: params.mail });
    if (validation.length) {
      ctx.throw(500, '该邮箱已被注册');
    } else {
      const register = await ctx.model.User.create({
        mail: params.mail,
        password: md5(params.password),
      });
      ctx.status = 200;
      ctx.session.userId = register._id;
    }
  }
}

module.exports = UserService;
