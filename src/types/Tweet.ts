export interface Tweet {
    id: string;
    url: string;
    username: string;
    displayName: string;
    mediaType: string;
    mediaUrls: string[];
    fileNames: string[];
    date: string;
    content: string;
    meta: {
        replies: number;
        retweets: number;
        likes: number;
    };
}
