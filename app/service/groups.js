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
      groupType: 'creator'
    })
    ctx.app.io.of('/').to('online').sockets[userSocketId].emit('updateRelation');
    ctx.status = 200;
    ctx.body = {
      id: groupId
    };
  }
  // 获取群成员
  async getUsers(groupId) {
    const { ctx } = this;
    // 返回联系人信息
    const usersData = await ctx.model.Relationship.aggregate([
      {
        $match: {
          status: true,
          type: 'group',
          relationId: groupId
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
          groupType: 1,
          'include._id': 1,
          'include.mail': 1,
          'include.nick': 1,
          'include.avatar': 1,
          'include.online': 1,
          'include.emoji': 1,
          'include.sign': 1,
        }
      }
    ]);
    ctx.status = 200;
    ctx.body = usersData;
  } 
  // 群聊邀请
  async invite(groupId, data) {
    const { ctx } = this;
    const userId = ctx.session.userId;
    const targetId = data.id;
    // 检查被添加人是否在线且通知
    const userData = await ctx.model.User.findOne({ _id: userId }).select('_id mail nick avatar online emoji sign');
    const targetData = await ctx.model.User.findOne({ _id: targetId }).select('_id mail nick avatar online emoji sign');
    const groupData = await ctx.model.Group.findOne({ _id: groupId });
    const time = new Date().getTime();
    ctx.status = 200;
    // 返回数据
    ctx.body = {
      id: '100000000000000000000000',
      time: time,
      content: {
        type: 'groupReq',
        id: targetId,
        groupId: groupId
      },
      include: targetData,
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
  // 群聊反馈
  async return(groupId, data) {
    const { ctx } = this;
    const userId = ctx.session.userId
    const targetId = data.id
    let status = ''
    if (data.accept) {
      status = '验证通过'
      // TODO 添加群关系
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
    }
    // 返回请求
    ctx.status = 200;

    // 邀请人刷新关系
    const userSocketId = (await ctx.model.User.findOne({ _id: userId })).socketId;
    ctx.app.io.of('/').to('online').sockets[userSocketId].emit('updateRelation');

    // 查找被添加人socket连接
    const targetSocketId = (await ctx.model.User.findOne({ _id: targetId })).socketId;
    const updateCardMsg = {
      id: '100000000000000000000000',
      time: data.time,
      update: {
        status: status
      }
    };
    if (targetSocketId) {
      ctx.app.io.of('/').to('online').sockets[targetSocketId].emit('updateCardMsg', updateCardMsg);
      ctx.app.io.of('/').to('online').sockets[targetSocketId].emit('updateRelation');
    } else {
      // 未读消息存入数据库
      ctx.model.Message.create({
        to: targetId,
        type: 'updateCardMsg',
        content: updateCardMsg
      })
    }
  }
}

module.exports = GroupsService;
