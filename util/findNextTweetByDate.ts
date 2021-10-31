import { tweets } from '../main';

export const findNextTweetIndexByDate = (): number => {
    const currentTime = Date.now() - 9.461e10; // 3 years ago

    const nextTweetIndex = tweets.findIndex(
        tweet => new Date(tweet.date).getTime() >= currentTime
    );

    return nextTweetIndex;
};
