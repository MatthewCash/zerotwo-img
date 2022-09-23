export interface Tweet {
    id: string;
    url: string;
    username: string;
    displayName: string;
    mediaType: string;
    mediaUrls: string[];
    fileNames: string[];
    date: Date;
    content: string;
    meta: {
        replies: number;
        retweets: number;
        likes: number;
    };
}
