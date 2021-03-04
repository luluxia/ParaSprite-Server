'use strict';

module.exports = () => {
  return async (ctx, next) => {
    console.log('connect ' + ctx.session.userId);
    ctx.socket.userId = ctx.session.userId;
    ctx.socket.join('online');
    ctx.socket.emit('res', 'connected!');
    await ctx.model.User.findOneAndUpdate(
      { _id: ctx.session.userId },
      { $set: { online: true } }
    )
    await next();
    // execute when disconnect.
    console.log('disconnection!');
    await ctx.model.User.findOneAndUpdate(
      { _id: ctx.session.userId },
      { $set: { online: false } }
    )
  };
};
