const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Collection:
 *       type: object
 *       required:
 *         - farmerId
 *         - species
 *         - gpsCoordinates
 *         - harvestDate
 *         - quantity
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the collection
 *         farmerId:
 *           type: string
 *           description: The farmer's user ID
 *         species:
 *           type: string
 *           description: The species of crop collected
 *         gpsCoordinates:
 *           type: object
 *           properties:
 *             lat:
 *               type: number
 *               description: Latitude
 *             lng:
 *               type: number
 *               description: Longitude
 *         harvestDate:
 *           type: string
 *           format: date-time
 *           description: The date of harvest
 *         quantity:
 *           type: number
 *           description: Quantity harvested in kg
 *         image:
 *           type: string
 *           description: Base64 encoded image or image URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the collection was recorded
 *       example:
 *         farmerId: "64f8a1b2c3d4e5f6a7b8c9d0"
 *         species: "Rice"
 *         gpsCoordinates:
 *           lat: 28.7041
 *           lng: 77.1025
 *         harvestDate: "2023-09-01T00:00:00.000Z"
 *         quantity: 100
 *         image: "data:image/jpeg;base64,..."
 */

const collectionSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  species: {
    type: String,
    required: true,
    trim: true
  },
  gpsCoordinates: {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  harvestDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: null
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for farmer queries
collectionSchema.index({ farmerId: 1, createdAt: -1 });

module.exports = mongoose.model('Collection', collectionSchema);
