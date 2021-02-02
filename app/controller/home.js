'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    const test = await ctx.model.User.find({_id: ctx.session.userId});
    console.log(test)
    ctx.body = ctx.session.userId;
  }
}

module.exports = HomeController;
