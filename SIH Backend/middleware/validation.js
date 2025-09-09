const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('farmer', 'processor', 'lab', 'consumer').required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const collectionSchema = Joi.object({
  farmerId: Joi.string().required(),
  species: Joi.string().min(2).max(100).required(),
  gpsCoordinates: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required()
  }).required(),
  harvestDate: Joi.date().required(),
  quantity: Joi.number().min(0).required(),
  image: Joi.string().allow(null, '')
});

const processingSchema = Joi.object({
  batchId: Joi.string().required(),
  processorId: Joi.string().required(),
  stepType: Joi.string().valid('drying', 'grinding', 'packaging', 'sorting', 'cleaning').required(),
  date: Joi.date().required(),
  metadata: Joi.object().default({})
});

const qualityTestSchema = Joi.object({
  batchId: Joi.string().required(),
  labId: Joi.string().required(),
  moisture: Joi.number().min(0).max(100).required(),
  pesticideLevel: Joi.number().min(0).required(),
  dnaResult: Joi.string().required(),
  certificateFile: Joi.string().allow(null, '')
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  collectionSchema,
  processingSchema,
  qualityTestSchema
};
