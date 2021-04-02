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
    await ctx.model.Relationship.create({
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
  }
}

module.exports = GroupsService;
