// import { Injectable } from '@angular/core';
// import { EasyRTCService, MessageType } from './easy-rtc.service';
// import { Subscription, BehaviorSubject } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class PostService {

//   posts$: BehaviorSubject<Post[]>;
//   posts: Post[];
//   peerListenerSubscription: Subscription;

//   constructor(private easyRTCService: EasyRTCService) {

//     this.posts = []
//     this.posts$ = new BehaviorSubject<Post[]>(this.posts);

//     easyRTCService.peerListenerEvents$.subscribe((event) => {

//       if(event.msgType === MessageType.POST) {
//         console.log(`Adding new post to post log: ${event.msgData}`);
//         this.posts.push(event.msgData);
//       }
//       this.posts$.next(this.posts);
//     });
//   }

//   public startPostStream(username: string) {
    
//     if(!this.easyRTCService.connectionOpen) {
//       this.easyRTCService.configureEasyRTCForData(username);
//     }

//   }

//   public sendPost(post: Post) {
//     this.posts.push({...post, author: 'You' });
//     this.posts$.next(this.posts);
//     console.log(`Adding new post to post log: ${post}`);
//     this.easyRTCService.sendDataToRoom(post, MessageType.POST);
//   }

//   public close(closeUnderlying: boolean) {
//     this.peerListenerSubscription.unsubscribe();

//     if(closeUnderlying && this.easyRTCService.connectionOpen) {
//       this.easyRTCService.close();
//     }
//   }
// }
