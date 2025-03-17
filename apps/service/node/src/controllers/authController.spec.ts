/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Pool, QueryResult } from 'pg';
import { register, login } from './authController';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('pg');

describe('Auth Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup response mock
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    // Setup request mock
    mockReq = {
      body: {},
    };

    // Setup database mock with all required Pool properties
    mockPool = {
      query: jest.fn().mockImplementation(() => Promise.resolve({ rows: [] })) as jest.Mock<Promise<QueryResult<any>>, any[]>,
      totalCount: 0,
      idleCount: 0,
      waitingCount: 0,
      expiredCount: 0,
      ending: false,
      ended: false,
      options: {},
      on: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
      release: jest.fn(),
      removeListener: jest.fn(),
      addListener: jest.fn(),
      off: jest.fn(),
      once: jest.fn(),
      emit: jest.fn(),
      eventNames: jest.fn(),
      getMaxListeners: jest.fn(),
      listenerCount: jest.fn(),
      listeners: jest.fn(),
      prependListener: jest.fn(),
      prependOnceListener: jest.fn(),
      rawListeners: jest.fn(),
      removeAllListeners: jest.fn(),
      setMaxListeners: jest.fn(),
    } as unknown as jest.Mocked<Pool>;

    // Mock jwt.sign
    (jwt.sign as jest.Mock).mockReturnValue('mock.jwt.token');
  });

  describe('register', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'app_client',
    };

    it('should successfully register a new user', async () => {
      mockReq.body = validUser;
      const mockResult = { rows: [{
        id: 1,
        email: validUser.email,
        role: validUser.role,
        created_at: new Date(),
      }]} as unknown as Promise<QueryResult<any>>;
      mockPool.query.mockResolvedValueOnce(mockResult as never);

      await register(mockReq as Request, mockRes as Response, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO app_public.users'),
        [validUser.email, validUser.password, validUser.role, validUser.name]
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          email: validUser.email,
          role: validUser.role,
        }),
        expect.any(String),
        expect.any(Object)
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        token: 'mock.jwt.token',
        user: expect.objectContaining({
          email: validUser.email,
          role: validUser.role,
        }),
      });
    });

    it('should fail when email is missing', async () => {
      mockReq.body = { ...validUser, email: undefined };

      await register(mockReq as Request, mockRes as Response, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields: email'
      });
    });

    it('should fail when name is missing', async () => {
      mockReq.body = { ...validUser, name: undefined };

      await register(mockReq as Request, mockRes as Response, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields: name'
      });
    });

    it('should fail when multiple required fields are missing', async () => {
      mockReq.body = { 
        ...validUser, 
        email: undefined, 
        name: undefined 
      };

      await register(mockReq as Request, mockRes as Response, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields: email, name'
      });
    });

    it('should fail when role is invalid', async () => {
      mockReq.body = { ...validUser, role: 'invalid_role' };

      await register(mockReq as Request, mockRes as Response, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid role specified',
      });
    });
  });

  describe('login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      mockReq.body = validCredentials;
      const mockResult = { rows: [{
        id: 1,
        email: validCredentials.email,
        role: 'app_client',
      }]} as unknown as Promise<QueryResult<any>>;
      mockPool.query.mockResolvedValueOnce(mockResult as never);

      await login(mockReq as Request, mockRes as Response, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM app_private.verify_password($1, $2)',
        [validCredentials.email, validCredentials.password]
      );
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        token: 'mock.jwt.token',
        user: expect.objectContaining({
          email: validCredentials.email,
        }),
      });
    });

    it('should fail with invalid credentials', async () => {
      mockReq.body = validCredentials;
      const mockResult = { rows: [] } as unknown as Promise<QueryResult<any>>;
      mockPool.query.mockResolvedValueOnce(mockResult as never);

      await login(mockReq as Request, mockRes as Response, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should handle database errors', async () => {
      mockReq.body = validCredentials;
      (mockPool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await login(mockReq as Request, mockRes as Response, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'An unexpected error occurred',
      });
    });
  });
}); 