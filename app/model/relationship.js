'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const RelationshipSchema = new Schema({
    relationId: { type: String },
    userId: { type: String },
    status: { type: Boolean },
    type: { type: String },
    remark: { type: String },
    group: { type: String },
    groupId: { type: Number },
    top: { type: Boolean },
    inChat: { type: Boolean },
    lastMsg: { type: String },
    lastMsgNum: { type: Number },
    lastActiveTime: { type: String }
  });

  return mongoose.model('Relationship', RelationshipSchema);
};
