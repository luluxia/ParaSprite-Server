'use strict';

const Controller = require('egg').Controller;
const fs = require('mz/fs');
const path = require('path');

module.exports = class extends Controller {
  // 头像上传
  async avatar() {
    const { ctx } = this;
    if (ctx.session.userId) {
      const file = ctx.request.files[0];
      const fileName = `${ctx.session.userId}${path.extname(file.filename)}`;
      const filePath = `app/public/avatar/${fileName}`;
      fs.renameSync(file.filepath, filePath);
      await ctx.model.User.findOneAndUpdate({ _id: ctx.session.userId }, { $set: { avatar: fileName } });
      ctx.body = {
        url: fileName
      }
      ctx.status = 200;
    } else {
      ctx.throw(500, '权限不足');
    }
  }
};
