'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app;
  // 测试
  router.get('/api/test', controller.home.index);
  // 登录
  router.post('/api/login', controller.users.login);
  // 获取联系人信息
  router.get('/api/get', controller.users.get);
  // 获取未读消息
  router.get('/api/message', controller.users.getUnread);
  // 新建用户
  router.post('/api/users/new', controller.users.new);
  // 添加好友
  router.post('/api/users/add', controller.users.add);
  // 好友请求反馈
  router.post('/api/users/add/return', controller.users.return);
  // 搜索好友
  router.post('/api/users/search', controller.users.search);
  // 修改单用户信息
  router.post('/api/users/:id', controller.users.edit);
  // 修改单用户头像
  router.post('/api/users/:id/avatar', controller.upload.avatar);
  // 上传图片
  router.post('/api/upload/img', controller.upload.img);
  // 创建群聊
  router.post('/api/groups/create', controller.groups.create);
  // 群聊邀请
  router.post('/api/groups/:id/invite', controller.groups.invite);
  // ws通信
  io.of('/').route('sendMsg', io.controller.chat.sendMsg);
  // ws设置id
  io.of('/').route('setId', io.controller.users.setId);
  // ws设置未读消息递增
  io.of('/').route('addLastMsgNum', io.controller.chat.addLastMsgNum);
  // ws清空未读消息
  io.of('/').route('clearLastMsgNum', io.controller.chat.clearLastMsgNum);
};
