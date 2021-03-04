'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app;
  // 登录
  router.post('/api/login', controller.users.login);
  // 获取联系人信息
  router.get('/api/get', controller.users.get);
  // 新建用户
  router.post('/api/users/new', controller.users.new);
  // 添加好友
  router.post('/api/users/add', controller.users.add);
  // 处理好友申请
  router.post('/api/users/add/return', controller.users.return);
  // 修改单用户信息
  router.post('/api/users/:id', controller.users.edit);
  // 修改单用户头像
  router.post('/api/users/:id/avatar', controller.upload.avatar);
  // ws通信
  io.of('/').route('sendMsg', io.controller.chat.sendMsg);
  // ws设置id
  io.of('/').route('setId', io.controller.users.setId);
  // ws设置未读消息递增
  io.of('/').route('addLastMsgNum', io.controller.chat.addLastMsgNum);
};
