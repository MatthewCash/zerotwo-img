import parse from 'csv-parse/lib/sync';
import fs from 'fs/promises';
import { performance } from 'perf_hooks';
import { Tweet } from '../types/Tweet';

export const saveCollectionRecord = async () => {
    const startTime = performance.now();

    const file = await fs.readFile('../images/collection/record.csv');

    console.log(`Loaded ${file.byteLength} bytes from disk`);

    const data = parse(file, {
        skipEmptyLines: true,
        columns: true,
        quote: '"',
        ltrim: true,
        rtrim: true,
        delimiter: ',',
        bom: true,
        fromLine: 6
    }) as any[];

    const formattedTweets = data.map(data => ({
        url: data['Tweet URL'] as string,
        username: data.Username as string,
        displayName: data['Display name'] as string,
        mediaType: data['Media type'] as string,
        mediaUrl: data['Media URL'] as string,
        fileName: data['Saved filename'] as string,
        date: data['Tweet date'] as string,
        content: data['Tweet content'] as string,
        meta: {
            replies: Number(data.Replies),
            retweets: Number(data.Retweets),
            likes: Number(data.Likes)
        }
    }));

    formattedTweets.reverse();

    const collapsedTweets = new Map<string, Tweet>();

    formattedTweets.forEach(tweet => {
        const urlParts = tweet.url.split('/');
        const tweetId = urlParts[urlParts.length - 1];

        const existingTweet = collapsedTweets.get(tweetId);

        const urlIndex = tweet.content.lastIndexOf(' https://t.co/');

        if (!existingTweet) {
            collapsedTweets.set(tweetId, {
                id: tweetId,
                url: tweet.url,
                username: tweet.username,
                displayName: tweet.displayName,
                mediaType: tweet.mediaType,
                mediaUrls: [tweet.mediaUrl],
                fileNames: [tweet.fileName],
                date: tweet.date,
                content: tweet.content.substr(0, urlIndex),
                meta: {
                    replies: tweet.meta.replies,
                    retweets: tweet.meta.retweets,
                    likes: tweet.meta.likes
                }
            });
        } else {
            existingTweet.mediaUrls.push(tweet.mediaUrl);
            existingTweet.fileNames.push(tweet.fileName);
        }
    });

    const collectionTweets = [...collapsedTweets.values()].filter(tweet =>
        tweet.content.includes('#ゼロツーコレクション')
    );

    console.log('Saving JSON');

    await fs.writeFile(
        '../images/collection/record.json',
        JSON.stringify(collectionTweets)
    );

    const endTime = performance.now();

    console.log(`Converted and saved to disk in ${endTime - startTime}ms`);
};

if (require.main === module) saveCollectionRecord();
