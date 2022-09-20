import fs from 'fs/promises';
import importedTweets from '../record.json';
import schedule from 'node-schedule';
import { Tweet } from './types/Tweet';
import { translateTextGoogle, translateTextMicrosoft } from './util/translate';
import { skipHashtags } from './util/hashtags';
import { findNextTweetIndexFromPrevious, sendTweetToTwitter } from './twitter';
import { saveLastTweetId } from './database';

export const tweets = importedTweets as Tweet[];

export const startTweetScheduler = async () => {
    while (true) {
        const nextTweetIndex = await findNextTweetIndexFromPrevious();
        const nextTweet = tweets[nextTweetIndex];

        const tweetDate = new Date(
            new Date(nextTweet.date).getTime() + 9.461e10
        );

        if (tweetDate.getTime() < Date.now()) {
            console.log(
                `Immediately publishing missed tweet scheduled for ${tweetDate.toLocaleString()}`
            );
        } else {
            console.log(
                `Next tweet scheduled for ${tweetDate.toLocaleString()}`
            );
            await new Promise(r => schedule.scheduleJob(tweetDate, r));
        }

        console.log(`Publishing tweet id: (${nextTweet.id})`);

        await publishTweet(nextTweet)
            .then(() => saveLastTweetId(nextTweet.id))
            .catch(error => console.warn('Tweet failed, will retry!'));
    }
};

const publishTweet = async (tweet: Tweet) => {
    const toTranslate = skipHashtags(tweet.content);

    let translatedText = await translateTextGoogle(toTranslate).catch(
        () => null
    );

    translatedText ||= await translateTextMicrosoft(toTranslate).catch(
        () => 'English Translation Unavailable'
    );

    const files = await Promise.all(
        tweet.fileNames.map(name => fs.readFile('./images/collection/' + name))
    );

    console.log(`Publishing tweet with ${files.length} images`);

    await sendTweetToTwitter(tweet, translatedText, files);
};

startTweetScheduler();
