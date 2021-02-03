'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app;
  // 新建用户
  router.post('/api/users/new', controller.users.new);
  // 修改单用户信息
  router.post('/api/users/:id', controller.users.edit);
  // 修改单用户头像
  router.post('/api/users/:id/avatar', controller.upload.avatar);
  // ws通信
  io.of('/').route('chat', io.controller.chat.index);
};
