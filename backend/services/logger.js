/**
 * Winston Logger with Elasticsearch Integration
 * Centralized logging for RapidRide
 */

const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

// Elasticsearch configuration
const esTransportOpts = {
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    maxRetries: 5,
    requestTimeout: 10000
  },
  index: 'rapidride-logs'
};

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'rapidride-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File output
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Add Elasticsearch transport if available
if (process.env.ELASTICSEARCH_ENABLED === 'true') {
  try {
    logger.add(new ElasticsearchTransport(esTransportOpts));
    logger.info('✅ Elasticsearch logging enabled');
  } catch (error) {
    logger.warn('⚠️ Elasticsearch transport not available:', error.message);
  }
}

module.exports = logger;
