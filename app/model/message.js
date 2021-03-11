'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const MessageSchema = new Schema({
    to: { type: String },
    type: { type: String },
    content: { type: Object }
  });

  return mongoose.model('Message', MessageSchema);
};
