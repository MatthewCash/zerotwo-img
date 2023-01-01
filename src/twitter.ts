import Twitter from 'twitter';

import { Tweet } from './types/Tweet';
import { getLastTweetId } from './database';
import { getTweets } from './tweetRecord';

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
        files.map(async file => {
            const res = await twitterClient.post('media/upload', {
                media: file,
                media_category: 'tweet_image'
            });

            return res?.media_id_string as string;
        })
    );

    const fullText = tweet.content + (translatedText ? '\n\n' + translatedText : '');
    const splitTranslation = fullText.length > 280;

    const content = splitTranslation ? tweet.content : fullText;

    if (content.length > 280) {
        console.log({ text: tweet.content, translatedText });
        throw new Error('Tweet too long!');
    }

    const newTweet = await twitterClient.post('statuses/update', {
        status: content,
        media_ids: mediaIds.join(',')
    });

    if (splitTranslation) {
        await twitterClient.post('statuses/update', {
            status: translatedText,
            in_reply_to_status_id: newTweet.id_str
        })
    }
};

export const findNextTweetFromPrevious = async (): Promise<Tweet> => {
    const lastTweetId = await getLastTweetId();

    if (!lastTweetId) return null;

    const tweets = getTweets();

    const lastTweetIndex = tweets.findIndex(tweet => tweet.id === lastTweetId);

    // Repeat at end
    if (lastTweetIndex === tweets.length - 1) return tweets[0];

    return tweets[lastTweetIndex + 1];
};
