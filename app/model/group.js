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
