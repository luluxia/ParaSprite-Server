/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {
    mongoose: {
      client: {
        url: 'mongodb://localhost:27017/ParaSprite',
        options: {},
      },
    },
    security: {
      csrf: {
        enable: false,
        ignoreJSON: true,
      },
      domainWhiteList: [ '*' ],
    },
    cors: {
      origin: '*', // 匹配规则  域名+端口  *则为全匹配
      allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    },
    multipart: {
      mode: 'file',
    },
    io: {
      namespace: {
        '/': {
          connectionMiddleware: [ 'connection' ],
          packetMiddleware: [],
        },
      },
    },
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1610697096183_9477';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
