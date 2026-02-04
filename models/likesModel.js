const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Like must belong to a user'],
    },
    targetType: {
      type: String,
      enum: ['Post', 'Comment'],
      required: [true, 'Like must have a target type'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Like must have a target'],
      refPath: 'targetType',
    },
  },
  { timestamps: true }
);

likeSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
likeSchema.index({ targetType: 1, targetId: 1 });
likeSchema.index({ userId: 1 });

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
