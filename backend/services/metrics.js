/**
 * Prometheus Metrics Service
 * Exposes application metrics for monitoring
 */

const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, Memory, etc.)
client.collectDefaultMetrics({ register });

// Custom Metrics

// HTTP Request Duration
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDuration);

// HTTP Request Counter
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestCounter);

// Active Rides Gauge
const activeRidesGauge = new client.Gauge({
  name: 'active_rides_total',
  help: 'Total number of active rides'
});
register.registerMetric(activeRidesGauge);

// Online Drivers Gauge
const onlineDriversGauge = new client.Gauge({
  name: 'online_drivers_total',
  help: 'Total number of online drivers'
});
register.registerMetric(onlineDriversGauge);

// ML Prediction Counter
const mlPredictionCounter = new client.Counter({
  name: 'ml_predictions_total',
  help: 'Total number of ML predictions',
  labelNames: ['model_type', 'status']
});
register.registerMetric(mlPredictionCounter);

// ML Prediction Duration
const mlPredictionDuration = new client.Histogram({
  name: 'ml_prediction_duration_seconds',
  help: 'Duration of ML predictions in seconds',
  labelNames: ['model_type'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});
register.registerMetric(mlPredictionDuration);

// Database Query Duration
const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'collection'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});
register.registerMetric(dbQueryDuration);

// Socket.IO Connections
const socketConnectionsGauge = new client.Gauge({
  name: 'socketio_connections_total',
  help: 'Total number of active Socket.IO connections'
});
register.registerMetric(socketConnectionsGauge);

// Middleware to track HTTP requests
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestCounter.labels(req.method, route, res.statusCode).inc();
  });
  
  next();
}

module.exports = {
  register,
  metricsMiddleware,
  httpRequestDuration,
  httpRequestCounter,
  activeRidesGauge,
  onlineDriversGauge,
  mlPredictionCounter,
  mlPredictionDuration,
  dbQueryDuration,
  socketConnectionsGauge
};
