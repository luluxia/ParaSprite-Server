'use strict';

module.exports = () => {
  return async (ctx, next) => {
    const id = ctx.session.userId
    console.log('用户上线：' + id + ' ' + ctx.socket.id);
    ctx.socket.userId = id;
    ctx.socket.join('online');
    ctx.socket.emit('res', 'connected!');
    await ctx.model.User.findOneAndUpdate(
      { _id: id },
      { $set: { online: true, socketId: ctx.socket.id } }
    )
    const contactList = await ctx.model.Relationship.find({ relationId: id }).select('userId')
    // console.log(contactList)
    await next();
    // execute when disconnect.
    console.log('用户下线：' + id + ' ' + ctx.socket.id);
    await ctx.model.User.findOneAndUpdate(
      { _id: ctx.session.userId },
      { $set: { online: false, socketId: '' } }
    )
  };
};
