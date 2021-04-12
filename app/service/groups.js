'use strict';

const Service = require('egg').Service;

class GroupsService extends Service {
  // 创建群聊
  async create(data) {
    const { ctx } = this;
    const createGroup = await ctx.model.Group.create({
      ...data,
      managerId: ctx.session.userId
    })
    const userId = ctx.session.userId;
    const groupId = createGroup._id;
    const userSocketId = (await ctx.model.User.findOne({ _id: userId })).socketId;
    // 添加群关系
    const create = await ctx.model.Relationship.create({
      status: true,
      type: 'group',
      remark: '',
      group: '我的群组',
      groupId: 0,
      top: 0,
      inChat: 0,
      lastMsg: '',
      lastMsgNum: 0,
      lastActiveTime: new Date().getTime(),
      relationId: groupId,
      userId: userId,
    })
    ctx.app.io.of('/').to('online').sockets[userSocketId].emit('updateRelation');
    ctx.status = 200;
    ctx.body = {
      id: groupId
    };
  }
  // 群聊邀请
  async invite(groupId, data) {
    const { ctx } = this;
    const userId = ctx.session.userId;
    const targetId = data.id;
    // 检查被添加人是否在线且通知
    const userData = await ctx.model.User.findOne({ _id: userId }).select('_id mail nick avatar online emoji sign');
    const groupData = await ctx.model.Group.findOne({ _id: groupId });
    const time = new Date().getTime();
    ctx.status = 200;
    // 返回数据
    ctx.body = {
      id: '100000000000000000000000',
      time: time,
      content: {
        type: 'groupReq',
        id: userId,
        groupId: groupId
      },
      include: userData,
      groupInclude: groupData
    }
    // 查找socket连接
    const targetSocketId = (await ctx.model.User.findOne({ _id: targetId })).socketId;
    const cardMsg = {
      id: '100000000000000000000000',
      time: time,
      content: {
        type: 'groupRes',
        id: userId,
        groupId: groupId
      },
      include: userData,
      groupInclude: groupData
    };
    if (targetSocketId) {
      ctx.app.io.of('/').to('online').sockets[targetSocketId].emit('getCardMsg', cardMsg);
    } else {
      // 未读消息存入数据库
      ctx.model.Message.create({
        to: targetId,
        type: 'cardMsg',
        content: cardMsg
      })
    }
    await ctx.model.Relationship.findOneAndUpdate({
      relationId: '100000000000000000000000',
      userId: userId
    }, {
      $set: {
        inChat: true,
        lastMsg: '发送了新的入群邀请'
      }
    })
    await ctx.model.Relationship.findOneAndUpdate({
      relationId: '100000000000000000000000',
      userId: targetId
    }, {
      $set: {
        inChat: true,
        lastMsg: '收到了新的入群邀请'
      }
    })
  }
}

module.exports = GroupsService;
