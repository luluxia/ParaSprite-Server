'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/api/register', controller.user.register);
  router.post('/api/avatar', controller.upload.uploadAvatar);
};
