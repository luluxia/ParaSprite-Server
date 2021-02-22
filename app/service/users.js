'use strict';

const Service = require('egg').Service;
const md5 = require('md5');

class UserService extends Service {
  // 登录
  async login(data) {
    const { ctx } = this;
    const validation = await ctx.model.User.findOneAndUpdate(
      { mail: data.mail, password: md5(data.password) },
      { $set: { online: true } }
    )
    if (validation[0]) {
      ctx.status = 200;
      ctx.body = { id: validation[0]._id }
      ctx.session.userId = validation[0]._id;
    } else {
      ctx.throw(500, '用户名或密码错误')
    }
  }
  // 获取联系人信息
  async get(userId) {
    const { ctx } = this;
    if (userId) {
      const usersData = await ctx.model.Relationship.find({
        status: true,
        type: 'user',
        userId: userId
      });
      usersData.forEach(element => {
        // TODO 格式化用户信息
      });
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
        avatar: `https://api.multiavatar.com/${md5(data.mail)}.png`,
        nick: data.mail,
        online: false,
        emoji: '',
        sign: ''
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
      const userId = ctx.session.userId
      // 检查是否添加自己
      if (ctx.session.userId != targetId) {
        // 检查关系是否存在
        const relationship = await ctx.model.Relationship.find({ relationId: targetId, userId: userId })
        if (relationship[0]) {
          // 检查关系是否通过
          if (relationship[0].status) {
            ctx.throw(500, '你们已经是好友啦！不用重复添加哟~');
          } else {
            ctx.throw(500, '您已经添加过该用户啦~请等待对方验证通过');
          }
        } else {
          const defaultData = {
            status: false,
            type: user,
            remark: '',
            group: '我的好友',
            lastMsg: '',
            lastMsgNum: 0
          }
          // 添加关系
          await ctx.model.Relationship.create({
            ...defaultData,
            relationId: targetId,
            userId: userId,
          })
          // TODO 对方通过后添加
          await ctx.model.Relationship.create({
            ...defaultData,
            relationId: userId,
            userId: targetId,
          })
        }
        ctx.status = 200;
        // TODO 检查被添加人是否在线且通知
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
