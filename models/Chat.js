const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    chatImage: { type: String },
    chatName: { type: String },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastTimeMessageRead: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", schema);
module.exports = Chat;
