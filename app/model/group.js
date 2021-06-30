'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const GroupSchema = new Schema({
    nick: { type: String },
    avatar: { type: String },
    intro: { type: String },
    managerId: { type: String }
  });

  return mongoose.model('Group', GroupSchema);
};

// websocket的特点和底层原理
// 客户端是如何实时向服务端发送数据的
// 客户端界面是如何进行编写的