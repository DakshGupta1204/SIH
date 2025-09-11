const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     QualityTest:
 *       type: object
 *       required:
 *         - batchId
 *         - labId
 *         - moisture
 *         - pesticideLevel
 *         - dnaResult
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the quality test
 *         batchId:
 *           type: string
 *           description: The batch ID being tested
 *         labId:
 *           type: string
 *           description: The lab's user ID
 *         moisture:
 *           type: number
 *           description: Moisture percentage
 *         pesticideLevel:
 *           type: number
 *           description: Pesticide level in ppm
 *         dnaResult:
 *           type: string
 *           description: DNA test result
 *         certificateFile:
 *           type: string
 *           description: Certificate file URL or base64
 *         testDate:
 *           type: string
 *           format: date-time
 *           description: The date of testing
 *         status:
 *           type: string
 *           enum: [pass, fail, pending]
 *           description: Test status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the test was recorded
 *       example:
 *         batchId: "64f8a1b2c3d4e5f6a7b8c9d1"
 *         labId: "64f8a1b2c3d4e5f6a7b8c9d3"
 *         moisture: 12.5
 *         pesticideLevel: 0.01
 *         dnaResult: "Authentic Rice DNA confirmed"
 *         certificateFile: "https://example.com/cert.pdf"
 */

const qualityTestSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moisture: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  pesticideLevel: {
    type: Number,
    required: true,
    min: 0
  },
  dnaResult: {
    type: String,
    required: true
  },
  certificateFile: {
    type: String,
    default: null
  },
  testDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pass', 'fail', 'pending'],
    default: 'pending'
  },
  additionalTests: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for batch queries
qualityTestSchema.index({ batchId: 1, testDate: -1 });

module.exports = mongoose.model('QualityTest', qualityTestSchema);
