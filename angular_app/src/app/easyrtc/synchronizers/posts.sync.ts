import { Post } from '../services/state';
import { removeDuplicates } from './common.sync';

/**
 * Synchronize two post streams
 * @param currentPosts - local post stream
 * @param newPosts - post stream from peer
 */
export function sync(currentPosts: Post[], newPosts: Post[]): Post[] {

    if (currentPosts.length === 0) {
        return newPosts;
    }

    if (newPosts.length === 0) {
        return currentPosts;
    }

    /**
     * Combine all posts together, remove duplicates, sort by date-time
     */
    const combinedPosts = currentPosts.concat(newPosts);
    const uniqueCombinedPosts = removeDuplicates(combinedPosts) as Post[];
    const syncedPosts = uniqueCombinedPosts.
    sort((a: Post, b: Post) => { // sort by date-time, old to new
        return new Date(a.postTime).getTime() - new Date(b.postTime).getTime();
    });
    
    return syncedPosts;

}
