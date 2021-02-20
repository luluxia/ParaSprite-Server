'use strict';

const Service = require('egg').Service;
const md5 = require('md5');

class UserService extends Service {
  // 登录
  async login(data) {
    const { ctx } = this;
    const validation = await ctx.model.User.find({ mail: data.mail, password: md5(data.password) })
    if (validation.length) {
      ctx.status = 200;
      ctx.body = { id: validation[0]._id }
      ctx.session.userId = validation[0]._id;
    } else {
      ctx.throw(500, '用户名或密码错误')
    }
  }
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
  // 添加好友
  async add(data) {
    const { ctx } = this;
    // 检查用户是否存在
    const validation = await ctx.model.User.find({ mail: data.mail });
    if (validation[0]) {
      const targetId = String(validation[0]._id);
      // 检查是否添加了自己
      if (ctx.session.userId != targetId) {
        // 检查关系是否存在
        const group = await ctx.model.Group.find({
          $or:[
            { userGroup: [ctx.session.userId, targetId] },
            { userGroup: [targetId, ctx.session.userId] }
          ]
        })
        if (group[0]) {
          const groupId = group[0]._id;
          const relationship = await ctx.model.Relationship.find({ groupId: groupId })
          // 检查关系是否通过
          if (relationship[0].status) {
            ctx.throw(500, '你们已经是好友啦！不用重复添加哟~');
          } else {
            ctx.throw(500, '您已经添加过该用户啦~请等待对方验证通过');
          }
        } else {
          // 创建群
          const createGroup = await ctx.model.Group.create({
            userGroup: [ctx.session.userId, targetId]
          });
          const groupId = createGroup._id;
          // 添加关系
          await ctx.model.Relationship.create({
            groupId: groupId,
            userId: ctx.session.userId,
            status: false,
            type: 'user'
          })
          await ctx.model.Relationship.create({
            groupId: groupId,
            userId: targetId,
            status: false,
            type: 'user'
          })
          console.log(ctx.app.io.sockets.sockets);
        }
        ctx.status = 200;
        // TODO 检查被添加人是否存在且通知
      } else {
        ctx.throw(500, '不能加自己为好友哦');
      }
    } else {
      ctx.throw(500, '啊哦，找不到该用户，请检查您输入的邮箱');
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
