import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subscription, BehaviorSubject } from 'rxjs';
import { scan } from 'rxjs/operators';
import { EasyRTCService, MessageType } from './easy-rtc.service';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  conversation$: BehaviorSubject<string[]>;

  private conversation: string[];

  peerListenerSubscription: Subscription;

  constructor(private easyRTCService: EasyRTCService) {

    this.conversation = [];
    this.conversation$ = new BehaviorSubject<string[]>(this.conversation);

    easyRTCService.peerListenerEvents$.subscribe((event) => {

      if (event.msgType === MessageType.MESSAGE) {
        console.log(`Adding new message to conversation log: ${event.msgData}`);
        this.conversation.push(`${event.user.username}: ${event.msgData}`);
      }
      this.conversation$.next(this.conversation);
    });

  }

  public startConversation(username: string) {
    
    if(!this.easyRTCService.connectionOpen) {
      this.easyRTCService.configureEasyRTCForData(username);
    }

  }

  public sendMessage(msg: string) {
    console.log(`Adding new message to conversation log: ${msg}`);
    this.conversation.push(`You: ${msg}`);
    this.conversation$.next(this.conversation);
    this.easyRTCService.sendDataToRoom(msg, MessageType.MESSAGE);
  }

  public close(closeUnderlying: boolean) {
    this.peerListenerSubscription.unsubscribe();

    if(closeUnderlying && this.easyRTCService.connectionOpen) {
      this.easyRTCService.close();
    }
  }
}
