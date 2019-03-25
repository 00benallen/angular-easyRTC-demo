import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { EasyRTCService } from './easyrtc/easy-rtc.service';
import { Observable, Subscription } from 'rxjs';
import { ConversationService } from './easyrtc/conversation.service';
import { PostService, Post } from './easyrtc/post.service';
import { v4 as uuid } from 'uuid';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-easyRTC-demo';

  loginId: string;
  loginIdSubscription: Subscription;
  conversationSubscription: Subscription;
  postSubscription: Subscription;
  occupants: string[];
  conversation: string[];
  posts: Post[];

  text: string;
  username: string;

  postTitle: string;
  postContent: string;

  constructor(
    private easyRTCService: EasyRTCService, 
    private conversationService: ConversationService,
    private postService: PostService,
    private changeDet: ChangeDetectorRef) {

  }

  ngOnInit() { 
    this.conversationSubscription = this.conversationService.conversation$.subscribe(conv => { 
      this.conversation = conv;
      this.changeDet.detectChanges();
    });

    this.loginIdSubscription = this.easyRTCService.loginId$.subscribe((loginId) => {
      this.loginId = loginId;
    });

    this.postSubscription = this.postService.posts$.subscribe(posts => {
      this.posts = posts;
      this.changeDet.detectChanges();
    });

    this.easyRTCService.onlineUsers$
    .pipe(map(users => users.map(user => user.username)))
    .subscribe(occupants => {
      this.occupants = occupants;
      this.changeDet.detectChanges();
    });
  }

  ngOnDestroy() {
    this.easyRTCService.close();
    this.conversationService.close(false);
    this.postService.close(false);
    this.loginIdSubscription.unsubscribe();
    this.conversationSubscription.unsubscribe();
  }

  startChat() {
    this.conversationService.startConversation(this.username);
    this.postService.startPostStream(this.username);
  }

  sendMessage() {
    this.conversationService.sendMessage(this.text);
    this.text = "";
  }

  sendPost() {
    this.postService.sendPost({
      id: uuid(),
      postTime: new Date(),
      author: this.loginId,
      title: this.postTitle,
      content: this.postContent
    });
    this.postTitle = "";
    this.postContent = "";
  }

  onUsernameType(username: string) {
    this.username = username;
  } 

  onMessageType(text: string) {
    this.text = text;
  }
}
