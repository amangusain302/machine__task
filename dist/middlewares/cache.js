"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheMiddleware = void 0;
const redis_1 = __importDefault(require("redis"));
const util_1 = __importDefault(require("util"));
const client = redis_1.default.createClient({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
});
// Promisify the `get` method for easier async/await usage
const getAsync = util_1.default.promisify(client.get).bind(client);
const cacheMiddleware = async (req, res, next) => {
    const key = req.originalUrl || req.url;
    try {
        const cachedData = await getAsync(key);
        if (cachedData) {
            res.json(JSON.parse(cachedData));
            return;
        }
        // Overwrite the `res.send` method to cache the response data
        const originalSend = res.send.bind(res);
        res.send = (body) => {
            client.setex(key, 600, JSON.stringify(body)); // Cache for 10 minutes
            originalSend(body);
        };
        next();
    }
    catch (error) {
        console.error('Redis error:', error);
        next(); // Proceed even if Redis fails to avoid blocking the request
    }
};
exports.cacheMiddleware = cacheMiddleware;
