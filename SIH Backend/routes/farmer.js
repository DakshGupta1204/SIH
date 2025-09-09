const express = require('express');
const Collection = require('../models/Collection');
const Batch = require('../models/Batch');
const { auth, authorize } = require('../middleware/auth');
const { validate, collectionSchema } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Farmer
 *   description: Farmer related endpoints
 */

/**
 * @swagger
 * /api/collection:
 *   post:
 *     summary: Create a new collection event
 *     tags: [Farmer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - farmerId
 *               - species
 *               - gpsCoordinates
 *               - harvestDate
 *               - quantity
 *             properties:
 *               farmerId:
 *                 type: string
 *                 example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *               species:
 *                 type: string
 *                 example: "Rice"
 *               gpsCoordinates:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: 28.7041
 *                   lng:
 *                     type: number
 *                     example: 77.1025
 *               harvestDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-09-01T00:00:00.000Z"
 *               quantity:
 *                 type: number
 *                 example: 100
 *               image:
 *                 type: string
 *                 example: "data:image/jpeg;base64,..."
 *     responses:
 *       201:
 *         description: Collection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 collection:
 *                   $ref: '#/components/schemas/Collection'
 *                 batch:
 *                   $ref: '#/components/schemas/Batch'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/collection', auth, authorize('farmer'), validate(collectionSchema), async (req, res) => {
  try {
    const { farmerId, species, gpsCoordinates, harvestDate, quantity, image } = req.body;

    // Verify farmer ID matches authenticated user or user is admin
    if (req.user._id.toString() !== farmerId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Can only create collections for yourself' });
    }

    // Create collection
    const collection = new Collection({
      farmerId,
      species,
      gpsCoordinates,
      harvestDate,
      quantity,
      image
    });

    await collection.save();

    // Create associated batch with QR code
    const batch = new Batch({
      collectionId: collection._id
    });

    await batch.save();

    // Populate farmer details
    await collection.populate('farmerId', 'name email');

    res.status(201).json({
      message: 'Collection created successfully',
      collection,
      batch: {
        id: batch._id,
        qrCode: batch.qrCode,
        status: batch.status
      }
    });
  } catch (error) {
    console.error('Collection creation error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Collection already exists' });
    }
    res.status(500).json({ message: 'Server error creating collection' });
  }
});

/**
 * @swagger
 * /api/collections/{farmerId}:
 *   get:
 *     summary: Get all collection events for a farmer
 *     tags: [Farmer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: farmerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The farmer's user ID
 *     responses:
 *       200:
 *         description: List of collections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 collections:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Collection'
 *                 total:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get('/collections/:farmerId', auth, async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Verify access - farmers can only see their own collections
    if (req.user._id.toString() !== farmerId && !['processor', 'lab', 'consumer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const collections = await Collection.find({ farmerId })
      .populate('farmerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      collections,
      total: collections.length
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ message: 'Server error fetching collections' });
  }
});

/**
 * @swagger
 * /api/collection/verify-species:
 *   post:
 *     summary: Verify species using ML model (mock endpoint)
 *     tags: [Farmer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - species
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 encoded image
 *                 example: "data:image/jpeg;base64,..."
 *               species:
 *                 type: string
 *                 description: Claimed species
 *                 example: "Rice"
 *     responses:
 *       200:
 *         description: Species verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 predicted_species:
 *                   type: string
 *                   example: "Rice"
 *                 confidence:
 *                   type: number
 *                   example: 0.95
 *                 is_match:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/collection/verify-species', auth, async (req, res) => {
  try {
    const { image, species } = req.body;

    if (!image || !species) {
      return res.status(400).json({ message: 'Image and species are required' });
    }

    // Mock ML model response
    const mockPredictions = ['Rice', 'Wheat', 'Corn', 'Barley', 'Oats'];
    const predicted_species = species; // For demo, assume correct prediction
    const confidence = Math.random() * 0.3 + 0.7; // Random confidence between 0.7-1.0
    const is_match = predicted_species.toLowerCase() === species.toLowerCase();

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      predicted_species,
      confidence: Math.round(confidence * 100) / 100,
      is_match,
      timestamp: new Date().toISOString(),
      note: 'This is a mock endpoint. Integrate with actual ML model for production.'
    });
  } catch (error) {
    console.error('Species verification error:', error);
    res.status(500).json({ message: 'Server error during species verification' });
  }
});

module.exports = router;
