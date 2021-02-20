'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const RelationshipSchema = new Schema({
    groupId: { type: String },
    userId: { type: String },
    status: { type: Boolean },
    type: { type: String },
    remark: { type: String },
    group: {type: String},
    lastMsg: {type: String},
    lastMsgNum: {type: Number}
  });

  return mongoose.model('Relationship', RelationshipSchema);
};
