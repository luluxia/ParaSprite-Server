'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const GroupSchema = new Schema({
    nick: { type: String },
    userGroup: { type: Array },
    managerId: { type: String },
    avatar: { type: String },
  });

  return mongoose.model('Group', GroupSchema);
};
