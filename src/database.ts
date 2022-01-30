import { createClient } from 'redis';

const redisKeyId = process.env.REDIS_KEY_ID || 'zerotwo_img:last_tweet_id';

const client = createClient();

client.connect();

export const getLastTeetId = async (): Promise<string> => {
    if (!client.isOpen) await client.connect();

    const lastTweetId = await client.get(redisKeyId);
    return lastTweetId;
};

export const saveLastTweetId = async (tweetId: string): Promise<void> => {
    if (!client.isOpen) await client.connect();

    await client.set(redisKeyId, tweetId.toString());
};
