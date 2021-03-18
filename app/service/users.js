'use strict';

const Service = require('egg').Service;
const md5 = require('md5');

class UserService extends Service {
  // 登录
  async login(data) {
    const { ctx } = this;
    await ctx.model.User.findOne({ mail: data.mail, password: md5(data.password) }).select(
      'nick avatar online emoji sign'
    ).then(res => {
      if (res) {
        ctx.status = 200;
        ctx.body = res;
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
            lastActiveTime: 1,
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
  // 获取未读消息
  async getUnread(userId) {
    const { ctx } = this;
    const message = await ctx.model.Message.find({ to: userId }).select('to type content');
    await ctx.model.Message.remove({ to: userId });
    ctx.status = 200;
    ctx.body = message;
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
      const userId = register._id
      // 添加系统通知
      await ctx.model.Relationship.create({
        status: true,
        type: 'user',
        remark: '',
        group: '我的服务',
        groupId: 0,
        top: 0,
        inChat: 0,
        lastMsg: '',
        lastMsgNum: 0,
        lastActiveTime: new Date().getTime(),
        relationId: "100000000000000000000000",
        userId: userId,
      })
      ctx.status = 200;
      ctx.body = {
        _id: register._id,
        nick: register.nick,
        avatar: register.avatar,
        online: register.online,
        emoji: register.emoji,
        sign: register.sign
      };
      ctx.session.userId = userId;
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
      console.log(userId)
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
            inChat: 1,
            lastMsg: '',
            lastMsgNum: 0
          }
          // 添加关系
          await ctx.model.Relationship.create({
            ...defaultData,
            relationId: targetId,
            userId: userId,
          })
          await ctx.model.Relationship.create({
            ...defaultData,
            relationId: userId,
            userId: targetId,
          })
        }
        // 返回对方数据
        const time = new Date().getTime()
        const targetData = await ctx.model.User.findOne({ _id: targetId }).select('_id mail nick avatar online emoji sign')
        ctx.status = 200;
        ctx.body = {
          userId: '100000000000000000000000',
          time: time,
          content: {
            type: 'friendReq',
            id: targetId
          },
          include: targetData
        }
        // 检查被添加人是否在线且通知
        const userData = await ctx.model.User.findOne({ _id: userId }).select('_id mail nick avatar online emoji sign')
        // 查找socket连接
        const targetSocketId = (await ctx.model.User.findOne({ _id: targetId })).socketId;
        if (targetSocketId) {
          ctx.app.io.of('/').to('online').sockets[targetSocketId].emit('getCardMsg', {
            id: '100000000000000000000000',
            time: time,
            content: {
              type: 'friendRes',
              id: userId
            },
            include: userData
          });
        } else {
          // TODO 未读消息存入数据库
        }
        await ctx.model.Relationship.findOneAndUpdate({
          relationId: '100000000000000000000000',
          userId: userId
        }, {
          $set: {
            inChat: true,
            lastMsg: '发送了新的好友请求'
          }
        })
        await ctx.model.Relationship.findOneAndUpdate({
          relationId: '100000000000000000000000',
          userId: targetId
        }, {
          $set: {
            inChat: true,
            lastMsg: '收到了新的好友请求'
          }
        })
        // TODO 对方不在线则存入数据库
      } else {
        ctx.throw(500, '不能加自己为好友哦');
      }
    } else {
      ctx.throw(500, '啊哦，找不到该用户，请检查您输入的邮箱');
    }
  }
  // 好友请求反馈
  async return(data) {
    const { ctx } = this;
    const userId = ctx.session.userId
    const targetId = data.id
    let status = ''
    if (data.accept) {
      status = '验证通过'
      await ctx.model.Relationship.findOneAndUpdate({
        relationId: userId,
        userId: targetId
      }, {
        $set: {
          status: true,
          lastActiveTime: data.time
        }
      })
      await ctx.model.Relationship.findOneAndUpdate({
        relationId: targetId,
        userId: userId
      }, {
        $set: {
          status: true,
          lastActiveTime: data.time
        }
      })
    } else {
      status = '验证未通过'
      await ctx.model.Relationship.remove({ relationId: userId, targetId: targetId })
      await ctx.model.Relationship.remove({ relationId: targetId, targetId: userId })
    }
    // 返回请求
    ctx.status = 200;

    // 添加人刷新关系
    const userSocketId = (await ctx.model.User.findOne({ _id: userId })).socketId;
    ctx.app.io.of('/').to('online').sockets[userSocketId].emit('updateRelation');

    // 查找被添加人socket连接
    const targetSocketId = (await ctx.model.User.findOne({ _id: targetId })).socketId;
    if (targetSocketId) {
      ctx.app.io.of('/').to('online').sockets[targetSocketId].emit('updateCardMsg', {
        id: '100000000000000000000000',
        time: data.time,
        update: {
          status: status
        }
      });
      ctx.app.io.of('/').to('online').sockets[targetSocketId].emit('updateRelation');
    } else {
      // TODO 未读消息存入数据库
    }
  }
  // 搜索好友
  async search(data) {
    const { ctx } = this;
    const search = await ctx.model.User.find({
      $or: [
        { mail: { $regex: data.input } },
        { nick: { $regex: data.input } }
      ],
      mail: { $ne: '' }
    }).select('mail avatar nick online emoji sign')
    ctx.status = 200;
    ctx.body = search;
  }
  // 修改单用户
  async edit(id, data) {
    const { ctx } = this;
    if (ctx.session.userId == id) {
      const change = await ctx.model.User.findOneAndUpdate({ _id: id }, { $set: { nick: data.nick } });
      ctx.status = 200;
      ctx.body = {
        _id: change._id,
        nick: data.nick,
        avatar: change.avatar,
        online: change.online,
        emoji: change.emoji,
        sign: change.sign
      };
    } else {
      ctx.throw(500, ctx.session.userId)
    }
  }
}

module.exports = UserService;
