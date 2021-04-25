'use strict';

const Controller = require('egg').Controller;

class DefaultController extends Controller {
  // 单聊
  async sendMsg() {
    const { ctx } = this;
    const userId = ctx.session.userId;
    const msg = ctx.args[0].msg;
    const targetId = ctx.args[0].userId;
    const time = ctx.args[0].time;
    // 查找socket连接
    const targetSocketId = (await ctx.model.User.findOne({ _id: targetId })).socketId;
    const sendContent = {
      id: userId,
      content: msg,
      type: 'user',
      time: String(time)
    }
    if (targetSocketId) {
      ctx.app.io.of('/').to('online').sockets[targetSocketId].emit('getMsg', sendContent);
    } else {
      // 未读消息存入数据库
      ctx.model.Message.create({
        to: targetId,
        type: 'msg',
        content: sendContent
      })
    }
    // 修改关系状态
    await ctx.model.Relationship.findOneAndUpdate({
      relationId: userId,
      userId: targetId
    }, {
      $set: {
        inChat: true,
        lastMsg: msg,
        lastActiveTime: time
      }
    })
    await ctx.model.Relationship.findOneAndUpdate({
      relationId: targetId,
      userId: userId
    }, {
      $set: {
        inChat: true,
        lastMsg: msg,
        lastActiveTime: time
      }
    })
    ctx.socket.emit('res', `Hi! I've got your message: ${ctx.args[0].msg}`);
  }
  // 群聊
  async sendGroupMsg() {
    const { ctx } = this;
    const userId = ctx.session.userId;
    const msg = ctx.args[0].msg;
    const groupId = ctx.args[0].groupId;
    const time = ctx.args[0].time;
    const sendContent = {
      id: groupId,
      from: userId,
      content: msg,
      type: 'group',
      time: String(time)
    }
    // 返回联系人信息
    const usersData = await ctx.model.Relationship.aggregate([
      {
        $match: {
          status: true,
          type: 'group',
          relationId: groupId,
          userId: { $ne: userId }
        }
      },
      {
        $addFields: {
          id: { $toObjectId: "$userId" }
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
          'include._id': 1,
          'include.socketId': 1,
        }
      }
    ]);
    // 遍历群员
    usersData.forEach(async user => {
      const data = user.include[0];
      if (data.socketId) {
        ctx.app.io.of('/').to('online').sockets[data.socketId].emit('getMsg', sendContent);
      } else {
        // 未读消息存入数据库
        ctx.model.Message.create({
          to: data._id,
          type: 'msg',
          content: sendContent
        });
      }
      // 修改关系状态
      await ctx.model.Relationship.findOneAndUpdate({
        relationId: groupId,
        userId: data._id
      }, {
        $set: {
          inChat: true,
          lastMsg: msg,
          lastActiveTime: time
        }
      })
    })
    // 发送者关系
    await ctx.model.Relationship.findOneAndUpdate({
      relationId: groupId,
      userId: userId
    }, {
      $set: {
        inChat: true,
        lastMsg: msg,
        lastActiveTime: time
      }
    })
  }
  // 设置新增消息
  async addLastMsgNum() {
    const { ctx } = this;
    const userId = ctx.session.userId;
    const targetId = ctx.args[0].id;
    await ctx.model.Relationship.findOneAndUpdate({
      relationId: targetId,
      userId: userId
    }, {
      $inc: {
        lastMsgNum: 1
      }
    })
  }
  // 清空新增消息
  async clearLastMsgNum() {
    const { ctx } = this;
    const userId = ctx.session.userId;
    const targetId = ctx.args[0].id;
    await ctx.model.Relationship.findOneAndUpdate({
      relationId: targetId,
      userId: userId
    }, {
      $set: {
        lastMsgNum: 0
      }
    })
  }
}

module.exports = DefaultController;
