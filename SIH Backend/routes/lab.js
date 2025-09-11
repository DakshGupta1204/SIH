const express = require('express');
const Processing = require('../models/Processing');
const QualityTest = require('../models/QualityTest');
const Batch = require('../models/Batch');
const Collection = require('../models/Collection');
const { auth, authorize } = require('../middleware/auth');
const { validate, processingSchema, qualityTestSchema } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Lab
 *   description: Lab and processing related endpoints
 */

/**
 * @swagger
 * /api/processing:
 *   post:
 *     summary: Add a processing step
 *     tags: [Lab]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batchId
 *               - processorId
 *               - stepType
 *               - date
 *             properties:
 *               batchId:
 *                 type: string
 *                 example: "64f8a1b2c3d4e5f6a7b8c9d1"
 *               processorId:
 *                 type: string
 *                 example: "64f8a1b2c3d4e5f6a7b8c9d2"
 *               stepType:
 *                 type: string
 *                 enum: [drying, grinding, packaging, sorting, cleaning]
 *                 example: "drying"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-09-02T00:00:00.000Z"
 *               metadata:
 *                 type: object
 *                 example:
 *                   temperature: 60
 *                   duration: 24
 *                   humidity: 15
 *     responses:
 *       201:
 *         description: Processing step added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 processing:
 *                   $ref: '#/components/schemas/Processing'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/processing', auth, authorize('processor'), validate(processingSchema), async (req, res) => {
  try {
    const { batchId, processorId, stepType, date, metadata } = req.body;

    // Verify processor ID matches authenticated user
    if (req.user._id.toString() !== processorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Can only add processing steps for yourself' });
    }

    // Verify batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Create processing step
    const processing = new Processing({
      batchId,
      processorId,
      stepType,
      date,
      metadata
    });

    await processing.save();

    // Update batch status
    if (batch.status === 'created') {
      batch.status = 'processing';
      await batch.save();
    }

    // Populate processor details
    await processing.populate('processorId', 'name email');
    await processing.populate('batchId');

    res.status(201).json({
      message: 'Processing step added successfully',
      processing
    });
  } catch (error) {
    console.error('Processing creation error:', error);
    res.status(500).json({ message: 'Server error adding processing step' });
  }
});

/**
 * @swagger
 * /api/quality-test:
 *   post:
 *     summary: Upload quality test results
 *     tags: [Lab]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batchId
 *               - labId
 *               - moisture
 *               - pesticideLevel
 *               - dnaResult
 *             properties:
 *               batchId:
 *                 type: string
 *                 example: "64f8a1b2c3d4e5f6a7b8c9d1"
 *               labId:
 *                 type: string
 *                 example: "64f8a1b2c3d4e5f6a7b8c9d3"
 *               moisture:
 *                 type: number
 *                 example: 12.5
 *               pesticideLevel:
 *                 type: number
 *                 example: 0.01
 *               dnaResult:
 *                 type: string
 *                 example: "Authentic Rice DNA confirmed"
 *               certificateFile:
 *                 type: string
 *                 example: "https://example.com/cert.pdf"
 *     responses:
 *       201:
 *         description: Quality test results uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 qualityTest:
 *                   $ref: '#/components/schemas/QualityTest'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/quality-test', auth, authorize('lab'), validate(qualityTestSchema), async (req, res) => {
  try {
    const { batchId, labId, moisture, pesticideLevel, dnaResult, certificateFile } = req.body;

    // Verify lab ID matches authenticated user
    if (req.user._id.toString() !== labId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Can only add test results for yourself' });
    }

    // Verify batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Determine test status based on values
    let status = 'pass';
    if (moisture > 14 || pesticideLevel > 0.5) {
      status = 'fail';
    }

    // Create quality test
    const qualityTest = new QualityTest({
      batchId,
      labId,
      moisture,
      pesticideLevel,
      dnaResult,
      certificateFile,
      status
    });

    await qualityTest.save();

    // Update batch status
    batch.status = 'tested';
    await batch.save();

    // Populate lab details
    await qualityTest.populate('labId', 'name email');
    await qualityTest.populate('batchId');

    res.status(201).json({
      message: 'Quality test results uploaded successfully',
      qualityTest
    });
  } catch (error) {
    console.error('Quality test creation error:', error);
    res.status(500).json({ message: 'Server error uploading test results' });
  }
});

/**
 * @swagger
 * /api/batches/{batchId}:
 *   get:
 *     summary: Get full batch details with collection, processing, and tests
 *     tags: [Lab]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema:
 *           type: string
 *         description: The batch ID
 *     responses:
 *       200:
 *         description: Full batch details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 batch:
 *                   $ref: '#/components/schemas/Batch'
 *                 collection:
 *                   $ref: '#/components/schemas/Collection'
 *                 processing:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Processing'
 *                 qualityTests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QualityTest'
 *       404:
 *         description: Batch not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/batches:
 *   get:
 *     summary: Get all available batches
 *     tags: [Lab]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available batches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   qrCode:
 *                     type: string
 *                   status:
 *                     type: string
 *                   collection:
 *                     type: object
 *                     properties:
 *                       species:
 *                         type: string
 *                       quantity:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/batches', auth, async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate({
        path: 'collectionId',
        select: 'species quantity harvestDate',
        populate: {
          path: 'farmerId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    res.json(batches);
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/batches/:batchId', auth, async (req, res) => {
  try {
    const { batchId } = req.params;

    // Find batch with collection details
    const batch = await Batch.findById(batchId)
      .populate({
        path: 'collectionId',
        populate: {
          path: 'farmerId',
          select: 'name email'
        }
      });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Get processing steps
    const processing = await Processing.find({ batchId })
      .populate('processorId', 'name email')
      .sort({ date: 1 });

    // Get quality tests
    const qualityTests = await QualityTest.find({ batchId })
      .populate('labId', 'name email')
      .sort({ testDate: -1 });

    res.json({
      batch,
      collection: batch.collectionId,
      processing,
      qualityTests
    });
  } catch (error) {
    console.error('Get batch details error:', error);
    res.status(500).json({ message: 'Server error fetching batch details' });
  }
});

// HEALTH CHECK for lab routes
router.get('/health', (req,res) => res.json({ status: 'ok', scope: 'lab-routes' }));

// Recent processing steps
router.get('/processing/recent', auth(['lab','processor']), async (req,res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit)||10, 50);
    const processing = await Processing.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ data: processing });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recent processing steps', error: err.message });
  }
});

// Recent quality tests
router.get('/quality-tests/recent', auth(['lab','processor']), async (req,res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit)||10, 50);
    const tests = await QualityTest.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ data: tests });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recent quality tests', error: err.message });
  }
});

module.exports = router;
