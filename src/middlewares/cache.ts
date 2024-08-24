import { Request, Response, NextFunction } from 'express';
import redis, { RedisClient } from 'redis';
import util from 'util';

const client: RedisClient = redis.createClient({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
});

// Promisify the `get` method for easier async/await usage
const getAsync = util.promisify(client.get).bind(client);

export const cacheMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = req.originalUrl || req.url;

    try {
        const cachedData = await getAsync(key);

        if (cachedData) {
            res.json(JSON.parse(cachedData));
            return;
        }

        // Overwrite the `res.send` method to cache the response data
        const originalSend = res.send.bind(res);
        res.send = (body: any) => {
            client.setex(key, 600, JSON.stringify(body)); // Cache for 10 minutes
            originalSend(body);
        };

        next();
    } catch (error) {
        console.error('Redis error:', error);
        next(); // Proceed even if Redis fails to avoid blocking the request
    }
};
