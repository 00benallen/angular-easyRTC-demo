import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { EasyRTCService } from './easyrtc/services/easy-rtc.service';
import { Subscription } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { State, User, ChatMessage, Post } from './easyrtc/services/state';
import { StateService, initialState } from './easyrtc/services/state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  /**
   * Variables from app state
   */
  easyRTCState: State;
  private stateSynchronizeSubscription: Subscription;
  private stateDetectChangesSubscription: Subscription | undefined;

  /**
   * Variables copied from app state for convenience in template
   */
  friendsOnline: User[];
  conversation: ChatMessage[];
  posts: Post[];

  /**
   * Bound variables from template
   */
  text: string;
  username: string | undefined;
  postTitle: string;
  postContent: string;
  usernameAlert: boolean;

  constructor(
    private easyRTCService: EasyRTCService,
    private changeDet: ChangeDetectorRef,
    private stateService: StateService) {

    this.text = '';
    this.postContent = '';
    this.postTitle = '';
    this.friendsOnline = [];
    this.conversation = [];
    this.posts = [];
    this.usernameAlert = false;

    this.easyRTCState = initialState;

    this.stateSynchronizeSubscription = this.stateService.stateEvents$.subscribe((state) => {
      this.easyRTCState = state;

      // Synchronize convenience variables with new state
      if (state) {

        if (state.room.loggedInUser) {
          this.username = state.room.loggedInUser.username;
        }
        this.friendsOnline = state.room.onlineUsers;
        this.conversation = state.room.chat;
        this.posts = state.room.postFeed;

      }

    });

  }

  ngOnInit() {

    this.stateDetectChangesSubscription = this.stateService.stateEvents$.subscribe((state) => {
      this.changeDet.detectChanges();
    });
  }

  ngOnDestroy() {
    this.easyRTCService.close();
    this.stateSynchronizeSubscription.unsubscribe();
    if (this.stateDetectChangesSubscription) {
      this.stateDetectChangesSubscription.unsubscribe();
    }
  }

  login() {
    if (this.username) {
      this.easyRTCService.configureEasyRTCForData(this.username);
    } else {
      this.usernameAlert = true;
    }
  }

  sendMessage() {

    if (this.easyRTCState) {
      this.easyRTCState.room.chat.push({
        id: uuid(),
        author: this.easyRTCService.buildUser(undefined, this.username),
        content: this.text,
        sentTime: new Date()
      });

      this.stateService.pushNewState({
        room: {
          chat: this.easyRTCState.room.chat,
          ...this.easyRTCState.room
        },
        connection: {
          ...this.easyRTCState.connection
        }
      },
      true);
    }

    this.text = '';
  }

  sendPost() {
    if (this.easyRTCState) {
      this.easyRTCState.room.postFeed.push({
        author: this.easyRTCService.buildUser(undefined, this.username),
        content: this.postContent,
        id: uuid(),
        postTime: new Date(),
        title: this.postTitle
      });

      this.stateService.pushNewState({
        room: {
          chat: this.easyRTCState.room.postFeed,
          ...this.easyRTCState.room
        },
        connection: {
          ...this.easyRTCState.connection
        }
      },
      true);
    }

    this.postTitle = '';
    this.postContent = '';
  }

  onUsernameType(username: string) {
    this.username = username;
  }

  onMessageType(text: string) {
    this.text = text;
  }
}
