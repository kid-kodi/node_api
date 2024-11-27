const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    type: { type: String, default: "text" },
    content: { type: String },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    replyTo: {
      message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      user: { type: mongoose.Schema.ObjectId, ref: "User" },
    },
    file: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", schema);

module.exports = Message;
