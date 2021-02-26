'use strict';

const Service = require('egg').Service;
const md5 = require('md5');

class UserService extends Service {
  // 登录
  async login(data) {
    const { ctx } = this;
    await ctx.model.User.findOneAndUpdate(
      { mail: data.mail, password: md5(data.password) },
      { $set: { online: true } }
    ).then(res => {
      if (res) {
        ctx.status = 200;
        ctx.body = { id: res._id };
        ctx.session.userId = res._id;
        console.log('now session ' + ctx.session.userId);
      } else {
        ctx.throw(500, '用户名或密码错误')
      }
    })
  }
  // 获取联系人信息
  async get(userId) {
    const { ctx } = this;
    if (userId) {
      // 返回联系人信息
      const usersData = await ctx.model.Relationship.aggregate([
        {
          $match: {
            status: true,
            type: 'user',
            userId: userId
          }
        },
        {
          $addFields: {
            id: { $toObjectId: "$relationId" }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'id',
            foreignField: '_id',
            as: 'include'
          }
        },
        {
          $project: {
            _id: 0,
            relationId: 1,
            type: 1,
            remark: 1,
            group: 1,
            groupId: 1,
            top: 1,
            inChat: 1,
            lastMsg: 1,
            lastMsgNum: 1,
            'include._id': 1,
            'include.mail': 1,
            'include.nick': 1,
            'include.avatar': 1,
            'include.online': 1,
            'include.emoji': 1,
            'include.sign': 1,
          }
        }
      ])
      // TODO 返回群信息
      ctx.status = 200;
      ctx.body = usersData
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
        avatar: '',
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
        const relation = await ctx.model.Relationship.find({ relationId: targetId, userId: userId })
        if (relation[0]) {
          // 检查自己添加对方的关系是否通过
          if (relation[0].status) {
            ctx.throw(500, '你们已经是好友啦！不用重复添加哟~');
          } else {
            ctx.throw(500, '您或对方已申请过好友关系，等待您或对方验证通过后就可以聊天啦');
          }
        } else {
          const defaultData = {
            status: false,
            type: 'user',
            remark: '',
            group: '我的好友',
            groupId: 1,
            top: 0,
            inChat: 0,
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
