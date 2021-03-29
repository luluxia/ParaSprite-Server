'use strict';

module.exports = () => {
  return async (ctx, next) => {
    const id = ctx.session.userId
    let contactList = []
    console.log('用户上线：' + id + ' ' + ctx.socket.id);
    ctx.socket.join('online');
    ctx.socket.emit('res', 'connected!');
    await ctx.model.User.findOneAndUpdate(
      { _id: id },
      { $set: { online: true, socketId: ctx.socket.id } }
    )
    const search = [
      {
        $match: {
          status: true,
          type: 'user',
          userId: id
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
          'include.socketId': 1,
        }
      },
      {
        $match: {
          include: { $ne: {} },
          'include.socketId': { $ne: '' },
        }
      }
    ]
    contactList = await ctx.model.Relationship.aggregate(search)
    contactList.forEach(element => {
      ctx.app.io.of('/').to('online').sockets[element.include[0].socketId]?.emit('updateRelation');
    });
    await next();
    // execute when disconnect.
    console.log('用户下线：' + id + ' ' + ctx.socket.id);
    await ctx.model.User.findOneAndUpdate(
      { _id: ctx.session.userId },
      { $set: { online: false, socketId: '' } }
    )
    contactList = await ctx.model.Relationship.aggregate(search)
    contactList.forEach(element => {
      ctx.app.io.of('/').to('online').sockets[element.include[0].socketId]?.emit('updateRelation');
    });
  };
};
