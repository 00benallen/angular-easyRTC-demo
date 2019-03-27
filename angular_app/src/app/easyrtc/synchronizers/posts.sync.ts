import { Post } from "../state";

export function sync(currentPosts: Post[], newPosts: Post[]): Post[] {

    if(currentPosts.length === 0) {
        return newPosts;
    } 

    if(newPosts.length === 0) {
        return currentPosts;
    }

    let syncPosts = removeDuplicates(currentPosts.concat(newPosts)).sort((a: Post, b: Post) => {
        return new Date(a.postTime).getTime() - new Date(b.postTime).getTime();
    });

    return syncPosts;

}

function removeDuplicates(posts: Post[]) {
    let uniqueIDs: string[] = [];
    var uniquePosts: Post[] = [];
    for(var i = 0; i < posts.length; i++){
        if(uniqueIDs.indexOf(posts[i].id) == -1){
            uniquePosts.push(posts[i]);
            uniqueIDs.push(posts[i].id);
        }
    }
    return uniquePosts;
}