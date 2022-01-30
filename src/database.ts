import redis from 'redis';

const redisKeyId = process.env.REDIS_KEY_ID || 'zerotwo_img:last_tweet_id';

const client = redis.createClient();

export const getLastTeetId = async (): Promise<string> => {
    const lastTweetId = await new Promise<string>(res => {
        client.get(redisKeyId, (error, value) => res(value));
    });
    return lastTweetId;
};

export const saveLastTweetId = async (tweetId: string): Promise<void> => {
    await new Promise(res => client.set(redisKeyId, tweetId.toString(), res));
};
