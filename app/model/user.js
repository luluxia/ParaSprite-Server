'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema = new Schema({
    mail: { type: String },
    password: { type: String },
    avatar: { type: String },
    nick: { type: String },
    online: { type: Boolean },
    emoji: { type: String },
    sign: { type: String }
  });

  return mongoose.model('User', UserSchema);
};
