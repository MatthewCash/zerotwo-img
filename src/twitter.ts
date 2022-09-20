import Twitter from 'twitter';
import { Tweet } from './types/Tweet';
import importedTweets from '../record.json';
import { getLastTeetId } from './database';

const tweets = importedTweets as Tweet[];

const twitterClient = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

export const sendTweetToTwitter = async (
    tweet: Tweet,
    translatedText: string,
    files: Buffer[]
) => {
    const mediaIds = await Promise.all(
        files.map(async (file, index) => {
            const res = await twitterClient
                .post('media/upload', {
                    media: file,
                    media_category: 'tweet_image'
                })

            return res?.media_id_string as string;
        })
    );

    const content =
        tweet.content + (translatedText ? '\n\n' + translatedText : '');

    await twitterClient
        .post('statuses/update', {
            status: content,
            media_ids: mediaIds.join(',')
        });
};

export const findNextTweetIndexFromPrevious = async (): Promise<number> => {
    const lastTweetId = await getLastTeetId();

    const lastTweetIndex = tweets.findIndex(tweet => tweet.id === lastTweetId);

    return lastTweetIndex + 1;
};
