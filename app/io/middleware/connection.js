'use strict';

module.exports = () => {
  return async (ctx, next) => {
    console.log('connect ' + ctx.session.userId);
    ctx.socket.userId = ctx.session.userId;
    ctx.socket.join('online');
    ctx.socket.emit('res', 'connected!');
    await next();
    // execute when disconnect.
    console.log('disconnection!');
  };
};
