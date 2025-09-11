const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Processing:
 *       type: object
 *       required:
 *         - batchId
 *         - processorId
 *         - stepType
 *         - date
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the processing step
 *         batchId:
 *           type: string
 *           description: The batch ID being processed
 *         processorId:
 *           type: string
 *           description: The processor's user ID
 *         stepType:
 *           type: string
 *           enum: [drying, grinding, packaging, sorting, cleaning]
 *           description: The type of processing step
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date of processing
 *         metadata:
 *           type: object
 *           description: Additional processing metadata
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the processing was recorded
 *       example:
 *         batchId: "64f8a1b2c3d4e5f6a7b8c9d1"
 *         processorId: "64f8a1b2c3d4e5f6a7b8c9d2"
 *         stepType: "drying"
 *         date: "2023-09-02T00:00:00.000Z"
 *         metadata:
 *           temperature: 60
 *           duration: 24
 *           humidity: 15
 */

const processingSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
    index: true
  },
  processorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stepType: {
    type: String,
    required: true,
    enum: ['drying', 'grinding', 'packaging', 'sorting', 'cleaning', 'washing', 'fermentation', 'storage']
  },
  date: {
    type: Date,
    required: true
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

processingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Processing', processingSchema);
