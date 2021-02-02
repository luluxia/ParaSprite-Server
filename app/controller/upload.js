'use strict';

const Controller = require('egg').Controller;
const fs = require('mz/fs');
const path = require('path');

module.exports = class extends Controller {
  async uploadAvatar() {
    const { ctx } = this;
    if (ctx.session.userId) {
      const file = ctx.request.files[0];
      const fileName = `${ctx.session.userId}${path.extname(file.filename)}`;
      const filePath = `app/public/avatar/${fileName}`;
      fs.renameSync(file.filepath, filePath);
      const update = await ctx.model.User.findOneAndUpdate({_id: ctx.session.userId}, {$set: {avatar: fileName}});
      ctx.status = 200;
    } else {
      ctx.throw(500, '获取不到用户信息');
    }
  }
};
