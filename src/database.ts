import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisKeyId = process.env.REDIS_KEY_ID || 'twitter-collection-bot:last_tweet_id';

const client = createClient({ url: redisUrl });

export const connectDatabase = () => client.connect();

export const getLastTeetId = async (): Promise<string> => {
    if (!client.isOpen) await client.connect();

    const lastTweetId = await client.get(redisKeyId);
    return lastTweetId;
};

export const saveLastTweetId = async (tweetId: string): Promise<void> => {
    if (!client.isOpen) await client.connect();

    await client.set(redisKeyId, tweetId.toString());
};
