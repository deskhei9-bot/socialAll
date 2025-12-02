import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';

/**
 * Twitter/X API v2 Service
 */
export class TwitterService {
  /**
   * Create Twitter client
   */
  private static getClient(accessToken: string, accessSecret: string): TwitterApi {
    return new TwitterApi({
      appKey: process.env.TWITTER_CLIENT_ID || '',
      appSecret: process.env.TWITTER_CLIENT_SECRET || '',
      accessToken,
      accessSecret,
    });
  }

  /**
   * Post a text tweet
   */
  static async postTweet(
    accessToken: string,
    accessSecret: string,
    text: string
  ): Promise<{ tweetId: string; url: string }> {
    try {
      const client = this.getClient(accessToken, accessSecret);
      const tweet = await client.v2.tweet(text);

      return {
        tweetId: tweet.data.id,
        url: `https://twitter.com/i/web/status/${tweet.data.id}`,
      };
    } catch (error: any) {
      throw new Error(`Twitter Post Error: ${error.message}`);
    }
  }

  /**
   * Post a tweet with media (photo/video)
   */
  static async postTweetWithMedia(
    accessToken: string,
    accessSecret: string,
    text: string,
    mediaPath: string,
    mediaType: 'photo' | 'video'
  ): Promise<{ tweetId: string; url: string }> {
    try {
      const client = this.getClient(accessToken, accessSecret);

      // Upload media
      const mediaId = await client.v1.uploadMedia(mediaPath, {
        mimeType: mediaType === 'photo' ? 'image/jpeg' : 'video/mp4',
      });

      // Post tweet with media
      const tweet = await client.v2.tweet({
        text,
        media: {
          media_ids: [mediaId],
        },
      });

      return {
        tweetId: tweet.data.id,
        url: `https://twitter.com/i/web/status/${tweet.data.id}`,
      };
    } catch (error: any) {
      throw new Error(`Twitter Media Post Error: ${error.message}`);
    }
  }

  /**
   * Post a tweet with multiple media
   */
  static async postTweetWithMultipleMedia(
    accessToken: string,
    accessSecret: string,
    text: string,
    mediaPaths: string[]
  ): Promise<{ tweetId: string; url: string }> {
    try {
      const client = this.getClient(accessToken, accessSecret);

      // Upload all media
      const mediaIds: string[] = [];
      for (const mediaPath of mediaPaths.slice(0, 4)) { // Max 4 images
        const mediaId = await client.v1.uploadMedia(mediaPath);
        mediaIds.push(mediaId);
      }

      // Post tweet with media
      const tweet = await client.v2.tweet({
        text,
        media: {
          media_ids: mediaIds as any,
        },
      });

      return {
        tweetId: tweet.data.id,
        url: `https://twitter.com/i/web/status/${tweet.data.id}`,
      };
    } catch (error: any) {
      throw new Error(`Twitter Multiple Media Post Error: ${error.message}`);
    }
  }

  /**
   * Post a thread (multiple connected tweets)
   */
  static async postThread(
    accessToken: string,
    accessSecret: string,
    tweets: string[]
  ): Promise<{ threadId: string; url: string; tweetIds: string[] }> {
    try {
      const client = this.getClient(accessToken, accessSecret);
      const tweetIds: string[] = [];
      let previousTweetId: string | undefined;

      for (const text of tweets) {
        const tweet = await client.v2.tweet({
          text,
          reply: previousTweetId ? { in_reply_to_tweet_id: previousTweetId } : undefined,
        });

        tweetIds.push(tweet.data.id);
        previousTweetId = tweet.data.id;
      }

      return {
        threadId: tweetIds[0],
        url: `https://twitter.com/i/web/status/${tweetIds[0]}`,
        tweetIds,
      };
    } catch (error: any) {
      throw new Error(`Twitter Thread Post Error: ${error.message}`);
    }
  }

  /**
   * Delete a tweet
   */
  static async deleteTweet(
    accessToken: string,
    accessSecret: string,
    tweetId: string
  ): Promise<void> {
    try {
      const client = this.getClient(accessToken, accessSecret);
      await client.v2.deleteTweet(tweetId);
    } catch (error: any) {
      throw new Error(`Twitter Delete Error: ${error.message}`);
    }
  }

  /**
   * Get user info
   */
  static async getUserInfo(
    accessToken: string,
    accessSecret: string
  ): Promise<{
    id: string;
    username: string;
    name: string;
    profileImageUrl: string;
    followersCount: number;
    followingCount: number;
  }> {
    try {
      const client = this.getClient(accessToken, accessSecret);
      const me = await client.v2.me({
        'user.fields': ['profile_image_url', 'public_metrics'],
      });

      return {
        id: me.data.id,
        username: me.data.username,
        name: me.data.name,
        profileImageUrl: me.data.profile_image_url || '',
        followersCount: me.data.public_metrics?.followers_count || 0,
        followingCount: me.data.public_metrics?.following_count || 0,
      };
    } catch (error: any) {
      throw new Error(`Twitter User Info Error: ${error.message}`);
    }
  }

  /**
   * Get tweet analytics
   */
  static async getTweetMetrics(
    accessToken: string,
    accessSecret: string,
    tweetId: string
  ): Promise<{
    likes: number;
    retweets: number;
    replies: number;
    quotes: number;
    impressions?: number;
  }> {
    try {
      const client = this.getClient(accessToken, accessSecret);
      const tweet = await client.v2.singleTweet(tweetId, {
        'tweet.fields': ['public_metrics', 'non_public_metrics'],
      });

      const metrics = tweet.data.public_metrics;

      return {
        likes: metrics?.like_count || 0,
        retweets: metrics?.retweet_count || 0,
        replies: metrics?.reply_count || 0,
        quotes: metrics?.quote_count || 0,
        impressions: (tweet.data as any).non_public_metrics?.impression_count,
      };
    } catch (error: any) {
      throw new Error(`Twitter Metrics Error: ${error.message}`);
    }
  }

  /**
   * Retweet
   */
  static async retweet(
    accessToken: string,
    accessSecret: string,
    tweetId: string
  ): Promise<void> {
    try {
      const client = this.getClient(accessToken, accessSecret);
      const me = await client.v2.me();
      await client.v2.retweet(me.data.id, tweetId);
    } catch (error: any) {
      throw new Error(`Twitter Retweet Error: ${error.message}`);
    }
  }

  /**
   * Like a tweet
   */
  static async likeTweet(
    accessToken: string,
    accessSecret: string,
    tweetId: string
  ): Promise<void> {
    try {
      const client = this.getClient(accessToken, accessSecret);
      const me = await client.v2.me();
      await client.v2.like(me.data.id, tweetId);
    } catch (error: any) {
      throw new Error(`Twitter Like Error: ${error.message}`);
    }
  }
}
