# SIH Backend - Supply Chain Tracking System

A comprehensive Node.js Express.js backend system for tracking agricultural products through the supply chain using blockchain-inspired traceability, ML-based species verification, and QR code tracking.

## 🚀 Features

- **Complete Supply Chain Tracking**: From farm to consumer
- **JWT Authentication**: Role-based access control (Farmer, Processor, Lab, Consumer)
- **QR Code Verification**: Instant product provenance lookup
- **ML Species Verification**: Mock endpoint ready for ML model integration
- **Quality Testing**: Lab results and certification management
- **Processing Steps**: Track drying, grinding, packaging, etc.
- **Consumer Analytics**: Scan statistics and engagement metrics
- **Swagger Documentation**: Complete API documentation at `/api-docs`

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi schema validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sih-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/sih-backend
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=12
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed sample data (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Sample Users (after seeding)
- **Farmer**: farmer@example.com / password123
- **Processor**: processor@example.com / password123
- **Lab**: lab@example.com / password123
- **Consumer**: consumer@example.com / password123

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Farmer APIs
- `POST /api/collection` - Create collection event
- `GET /api/collections/:farmerId` - Get farmer's collections
- `POST /api/collection/verify-species` - ML species verification (mock)

### Lab/Processing APIs
- `POST /api/processing` - Add processing step
- `POST /api/quality-test` - Upload quality test results
- `GET /api/batches/:batchId` - Get full batch details

### Consumer APIs
- `GET /api/verify/:qrCode` - Verify product using QR code
- `GET /api/scan-stats/:batchId` - Get scan statistics
- `GET /api/batches` - List all batches (admin)

## 🏗 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (farmer|processor|lab|consumer),
  timestamps: true
}
```

### Collection
```javascript
{
  farmerId: ObjectId (User),
  species: String,
  gpsCoordinates: { lat: Number, lng: Number },
  harvestDate: Date,
  quantity: Number,
  image: String,
  verificationStatus: String,
  timestamps: true
}
```

### Batch
```javascript
{
  collectionId: ObjectId (Collection),
  qrCode: String (unique),
  status: String (created|processing|tested|distributed),
  scanCount: Number,
  scanHistory: Array,
  timestamps: true
}
```

### Processing
```javascript
{
  batchId: ObjectId (Batch),
  processorId: ObjectId (User),
  stepType: String (drying|grinding|packaging|sorting|cleaning),
  date: Date,
  metadata: Object,
  status: String,
  timestamps: true
}
```

### QualityTest
```javascript
{
  batchId: ObjectId (Batch),
  labId: ObjectId (User),
  moisture: Number,
  pesticideLevel: Number,
  dnaResult: String,
  certificateFile: String,
  testDate: Date,
  status: String (pass|fail|pending),
  timestamps: true
}
```

## 🔄 Workflow

1. **Farmer** creates collection event → **Batch** with QR code generated
2. **Processor** adds processing steps to batch
3. **Lab** uploads quality test results
4. **Consumer** scans QR code to verify product provenance
5. **Analytics** track scan statistics and consumer engagement

## 🧪 Testing

Test the APIs using:
- **Swagger UI**: http://localhost:3000/api-docs
- **Postman**: Import the API endpoints
- **curl**: Command line testing

### Sample Request Flow

1. **Register/Login**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "farmer@example.com", "password": "password123"}'
   ```

2. **Create Collection (with token)**
   ```bash
   curl -X POST http://localhost:3000/api/collection \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "farmerId": "USER_ID",
       "species": "Rice",
       "gpsCoordinates": {"lat": 28.7041, "lng": 77.1025},
       "harvestDate": "2023-09-01T00:00:00.000Z",
       "quantity": 100
     }'
   ```

3. **Verify QR Code (public)**
   ```bash
   curl http://localhost:3000/api/verify/BATCH-RICE-001
   ```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sih-backend
JWT_SECRET=your-super-secure-production-secret
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
```

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Development

### Project Structure
```
sih-backend/
├── models/          # MongoDB schemas
├── routes/          # API route handlers
├── middleware/      # Authentication & validation
├── utils/           # Database connection & utilities
├── server.js        # Main application file
├── package.json     # Dependencies
└── README.md       # This file
```

### Adding New Features

1. **New Model**: Add to `models/` directory
2. **New Routes**: Add to `routes/` directory
3. **Validation**: Add schemas to `middleware/validation.js`
4. **Documentation**: Add Swagger comments to route files

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api-docs`
- Review error logs in the server console
- Ensure MongoDB is running and accessible
- Verify environment variables are set correctly

## 🔮 Future Enhancements

- [ ] Real ML model integration for species verification
- [ ] Blockchain integration for immutable records
- [ ] Real-time notifications using WebSockets
- [ ] Advanced analytics dashboard
- [ ] Mobile app QR scanner integration
- [ ] Geolocation tracking for supply chain mapping
- [ ] Multi-language support
- [ ] Advanced search and filtering capabilities
