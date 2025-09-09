const request = require('supertest');
const app = require('../server');

describe('Health Check', () => {
  test('GET /health should return 200', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);
    
    expect(res.body.status).toBe('OK');
  });
});

describe('Authentication', () => {
  test('POST /api/auth/register should create a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'farmer'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
    
    expect(res.body.message).toBe('User registered successfully');
    expect(res.body.user.email).toBe(userData.email);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login should authenticate user', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);
    
    expect(res.body.message).toBe('Login successful');
    expect(res.body.token).toBeDefined();
  });
});

describe('API Documentation', () => {
  test('GET /api-docs should serve Swagger UI', async () => {
    const res = await request(app)
      .get('/api-docs/')
      .expect(200);
    
    expect(res.text).toContain('Swagger UI');
  });
});
