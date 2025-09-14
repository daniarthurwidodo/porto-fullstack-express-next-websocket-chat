import { Request, Response, NextFunction } from 'express';

// Custom error class for application-specific errors
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error logging utility
export const logError = (error: Error): void => {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
};

// Global error handling middleware
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logError(error);

  // If response has already been sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(error);
  }

  // Handle operational errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
    return;
  }

  // Handle mongoose validation errors
  if (error.name === 'ValidationError') {
    const message = Object.values((error as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    res.status(400).json({
      status: 'error',
      message: `Validation Error: ${message}`
    });
    return;
  }

  // Handle mongoose duplicate key errors
  if (error.name === 'MongoError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyValue)[0];
    const value = (error as any).keyValue[field];
    res.status(400).json({
      status: 'error',
      message: `Duplicate field value: ${value} for field: ${field}`
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
    return;
  }

  // Default error response
  console.error('Unhandled error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: error.message, stack: error.stack })
  });
};

// Handle uncaught exceptions
export const handleUncaughtExceptions = (): void => {
  process.on('uncaughtException', (error: Error) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    logError(error);
    process.exit(1);
  });
};

// Handle unhandled promise rejections
export const handleUnhandledRejections = (): void => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    
    // Allow time for cleanup before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};