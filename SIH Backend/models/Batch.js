const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Batch:
 *       type: object
 *       required:
 *         - collectionId
 *         - qrCode
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the batch
 *         collectionId:
 *           type: string
 *           description: Reference to the collection event
 *         qrCode:
 *           type: string
 *           description: Unique QR code for the batch
 *         status:
 *           type: string
 *           enum: [created, processing, tested, distributed]
 *           description: Current batch status
 *         scanCount:
 *           type: number
 *           description: Number of times QR code has been scanned
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the batch was created
 *       example:
 *         collectionId: "64f8a1b2c3d4e5f6a7b8c9d0"
 *         qrCode: "BATCH001-2023-001"
 *         status: "created"
 *         scanCount: 0
 */

const batchSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true,
    unique: true
  },
  qrCode: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['created', 'processing', 'tested', 'distributed'],
    default: 'created'
  },
  scanCount: {
    type: Number,
    default: 0
  },
  scanHistory: [{
    scannedAt: {
      type: Date,
      default: Date.now
    },
    location: {
      lat: Number,
      lng: Number
    },
    scannedBy: {
      type: String,
      default: 'anonymous'
    }
  }]
}, {
  timestamps: true
});

// Generate QR code before saving
batchSchema.pre('save', function(next) {
  if (!this.qrCode) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    this.qrCode = `BATCH-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Index for QR code queries
batchSchema.index({ qrCode: 1 });
batchSchema.index({ collectionId: 1 });

module.exports = mongoose.model('Batch', batchSchema);
