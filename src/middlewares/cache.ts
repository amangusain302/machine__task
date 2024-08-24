import { Request, Response, NextFunction } from 'express';
import redis, { RedisClient } from 'redis';
import util from 'util';

const client: RedisClient = redis.createClient({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
});


const getAsync = util.promisify(client.get).bind(client);

export const cacheMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = req.originalUrl || req.url;

    try {
        const cachedData = await getAsync(key);

        if (cachedData) {
            res.json(JSON.parse(cachedData));
            return;
        }

       
        const originalSend = res.send.bind(res);
        res.send = (body: any) => {
            client.setex(key, 600, JSON.stringify(body)); 
            originalSend(body);
        };

        next();
    } catch (error) {
        console.error('Redis error:', error);
        next(); 
    }
};
