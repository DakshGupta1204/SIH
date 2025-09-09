const express = require('express');
const Batch = require('../models/Batch');
const Collection = require('../models/Collection');
const Processing = require('../models/Processing');
const QualityTest = require('../models/QualityTest');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Consumer
 *   description: Consumer related endpoints for product verification
 */

/**
 * @swagger
 * /api/verify/{qrCode}:
 *   get:
 *     summary: Verify product using QR code and get provenance information
 *     tags: [Consumer]
 *     parameters:
 *       - in: path
 *         name: qrCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The QR code to verify
 *         example: "BATCH-1693488000000-ABC123"
 *     responses:
 *       200:
 *         description: Product provenance information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verified:
 *                   type: boolean
 *                   example: true
 *                 batch:
 *                   $ref: '#/components/schemas/Batch'
 *                 provenance:
 *                   type: object
 *                   properties:
 *                     collection:
 *                       $ref: '#/components/schemas/Collection'
 *                     processing:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Processing'
 *                     qualityTests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/QualityTest'
 *                 timeline:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       event:
 *                         type: string
 *                       details:
 *                         type: object
 *       404:
 *         description: QR code not found
 *       500:
 *         description: Server error
 */
router.get('/verify/:qrCode', async (req, res) => {
  try {
    const { qrCode } = req.params;

    // Find batch by QR code
    const batch = await Batch.findOne({ qrCode })
      .populate({
        path: 'collectionId',
        populate: {
          path: 'farmerId',
          select: 'name email'
        }
      });

    if (!batch) {
      return res.status(404).json({ 
        verified: false,
        message: 'QR code not found or invalid' 
      });
    }

    // Update scan count and history
    batch.scanCount += 1;
    batch.scanHistory.push({
      scannedAt: new Date(),
      location: null, // Could be populated from request IP geolocation
      scannedBy: 'consumer'
    });
    await batch.save();

    // Get all related data
    const processing = await Processing.find({ batchId: batch._id })
      .populate('processorId', 'name email')
      .sort({ date: 1 });

    const qualityTests = await QualityTest.find({ batchId: batch._id })
      .populate('labId', 'name email')
      .sort({ testDate: -1 });

    // Build timeline
    const timeline = [];
    
    // Add collection event
    timeline.push({
      date: batch.collectionId.harvestDate,
      event: 'Harvest',
      details: {
        farmer: batch.collectionId.farmerId.name,
        species: batch.collectionId.species,
        quantity: batch.collectionId.quantity,
        location: batch.collectionId.gpsCoordinates
      }
    });

    // Add processing events
    processing.forEach(proc => {
      timeline.push({
        date: proc.date,
        event: `Processing: ${proc.stepType}`,
        details: {
          processor: proc.processorId.name,
          metadata: proc.metadata
        }
      });
    });

    // Add quality test events
    qualityTests.forEach(test => {
      timeline.push({
        date: test.testDate,
        event: 'Quality Test',
        details: {
          lab: test.labId.name,
          status: test.status,
          moisture: test.moisture,
          pesticideLevel: test.pesticideLevel,
          dnaResult: test.dnaResult
        }
      });
    });

    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      verified: true,
      batch: {
        id: batch._id,
        qrCode: batch.qrCode,
        status: batch.status,
        scanCount: batch.scanCount,
        createdAt: batch.createdAt
      },
      provenance: {
        collection: batch.collectionId,
        processing,
        qualityTests
      },
      timeline
    });
  } catch (error) {
    console.error('QR verification error:', error);
    res.status(500).json({ 
      verified: false,
      message: 'Server error during verification' 
    });
  }
});

/**
 * @swagger
 * /api/scan-stats/{batchId}:
 *   get:
 *     summary: Get scan statistics and consumer analytics for a batch
 *     tags: [Consumer]
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
 *         description: Scan statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 batchId:
 *                   type: string
 *                 totalScans:
 *                   type: number
 *                 uniqueScans:
 *                   type: number
 *                 scanHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       scannedAt:
 *                         type: string
 *                         format: date-time
 *                       location:
 *                         type: object
 *                       scannedBy:
 *                         type: string
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     firstScan:
 *                       type: string
 *                       format: date-time
 *                     lastScan:
 *                       type: string
 *                       format: date-time
 *                     averageScansPerDay:
 *                       type: number
 *       404:
 *         description: Batch not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/scan-stats/:batchId', auth, async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Calculate analytics
    const scanHistory = batch.scanHistory;
    const totalScans = batch.scanCount;
    const uniqueScans = scanHistory.length; // Simplified - could track unique IPs/users
    
    let analytics = {
      firstScan: null,
      lastScan: null,
      averageScansPerDay: 0
    };

    if (scanHistory.length > 0) {
      const sortedScans = scanHistory.sort((a, b) => new Date(a.scannedAt) - new Date(b.scannedAt));
      analytics.firstScan = sortedScans[0].scannedAt;
      analytics.lastScan = sortedScans[sortedScans.length - 1].scannedAt;
      
      // Calculate average scans per day
      const daysDiff = Math.max(1, Math.ceil((new Date(analytics.lastScan) - new Date(analytics.firstScan)) / (1000 * 60 * 60 * 24)));
      analytics.averageScansPerDay = Math.round((totalScans / daysDiff) * 100) / 100;
    }

    res.json({
      batchId: batch._id,
      qrCode: batch.qrCode,
      totalScans,
      uniqueScans,
      scanHistory: scanHistory.slice(-50), // Return last 50 scans
      analytics
    });
  } catch (error) {
    console.error('Get scan stats error:', error);
    res.status(500).json({ message: 'Server error fetching scan statistics' });
  }
});

/**
 * @swagger
 * /api/batches:
 *   get:
 *     summary: Get all batches (admin/lab access)
 *     tags: [Consumer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [created, processing, tested, distributed]
 *         description: Filter by batch status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of batches to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of batches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 batches:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Batch'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     pages:
 *                       type: number
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/batches', auth, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const [batches, total] = await Promise.all([
      Batch.find(query)
        .populate({
          path: 'collectionId',
          populate: {
            path: 'farmerId',
            select: 'name email'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Batch.countDocuments(query)
    ]);

    const pages = Math.ceil(total / limit);

    res.json({
      batches,
      pagination: {
        total,
        pages,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ message: 'Server error fetching batches' });
  }
});

module.exports = router;
