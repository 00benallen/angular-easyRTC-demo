//This gives us access to the static type declarations given by easyRTC
/// <reference path="../../../node_modules/easyrtc/typescript_support/d.ts.files/client/easyrtc.d.ts" />

/**
 * Imports
 */
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ReplaySubject, AsyncSubject, Subscription, Observable, BehaviorSubject } from 'rxjs';
import { map, combineLatest } from 'rxjs/operators';

/**
 * The socket.io.js and easyrtc.js files expose these two global variables, 
 * here we try to grab them from the window
 */
export const io = window["io"];

export type PeerListenerEvent = {
  user: User, 
  msgType: string, 
  msgData: any, 
  targetting: Easyrtc_MessageTargeting
}

export type Message = {
  data: any,
  type: MessageType
}

export enum MessageType {
  GENERAL_BROADCAST = "GENERAL_BROADCAST",
  MESSAGE = "MESSAGE",
  POST = "POST"
}

export type User = {
  easyRTCId: string,
  username: string
}

export type UserChange = {
  user: User,
  changeType: 'added' | 'removed'
}

/**
 * Service for accessing basic features in easyRTC, setup for data channels (no audio/video)
 */
@Injectable({
  providedIn: 'root'
})
export class EasyRTCService {

  /**
   * Subjects for various RTC state 
   */
  connectionOpen: boolean = false;
  loginId$: AsyncSubject<string>;

  onlineUsers$: BehaviorSubject<User[]>;
  private onlineUsers: User[];
  private onlineUsersChanges$: ReplaySubject<UserChange>;
  messagesToSend$: ReplaySubject<Message>;

  private p2pMessageSendSubscription: Subscription;
  private onlineUserChangesSubscription: Subscription

  peerListenerEvents$: ReplaySubject<PeerListenerEvent>;



  constructor() { 

    this.loginId$ = new AsyncSubject();
    this.onlineUsersChanges$ = new ReplaySubject<UserChange>();
    this.peerListenerEvents$ = new ReplaySubject<PeerListenerEvent>();
    this.messagesToSend$ = new ReplaySubject<Message>();
    this.onlineUsers = [];
    this.onlineUsers$ = new BehaviorSubject<User[]>([]);

    this.p2pMessageSendSubscription = this.messagesToSend$.subscribe(message => {

      for(let user of this.onlineUsers) {

        console.log(`Sending ${message.data as string} to ${user.username}`);
        easyrtc.sendDataP2P(user.easyRTCId, message.type, message.data);

      }
    })

    this.onlineUserChangesSubscription = this.onlineUsersChanges$.subscribe(changes => {
      if(changes.changeType === 'added') {
        console.log(`Adding ${changes.user.username} to list of online users`);
        this.onlineUsers.push(changes.user);
      } else {
        console.log(`Removing ${changes.user.username} from list of online users`);
        const index = this.onlineUsers.indexOf(changes.user, 0);
        if (index > -1) {
          this.onlineUsers.splice(index, 1);
        }
      }
      this.onlineUsers$.next(this.onlineUsers);
      
    })

    if (!io) {
      throw "Socket.io could not be obtained from global script, easyRTC server may not be connected";
    }

    if (!easyrtc) {
      throw "EasyRTC could not be obtained from global script, easyRTC server may not be connected";
    }

    let socket = io.connect(environment.easyRTCServer);
    easyrtc.useThisSocketConnection(socket);
  }

  public sendDataToRoom(data: any, type: MessageType) {

    this.messagesToSend$.next({data: data, type: type});

  }

  public configureEasyRTCForData(username: string) {
    easyrtc.enableDebug(false);
    easyrtc.enableDataChannels(true);
    easyrtc.enableVideo(false);
    easyrtc.enableAudio(false);
    easyrtc.enableVideoReceive(false);
    easyrtc.enableAudioReceive(false);
    easyrtc.setDataChannelOpenListener(this.openListener.bind(this))
    easyrtc.setDataChannelCloseListener(this.closeListener.bind(this))
    easyrtc.setPeerListener(this.peerListener.bind(this));
    easyrtc.setRoomOccupantListener(this.occupantListener.bind(this));
    if(username) {
      easyrtc.setUsername(username);
    }
    easyrtc.connect("easyrtc.dataMessaging", this.loginSuccess.bind(this), this.loginFailure.bind(this));
    this.connectionOpen = true;
    console.log("Connected to easyRTC server");
  }

  public close() {

    easyrtc.disconnect();
    io.disconnect();
    this.p2pMessageSendSubscription.unsubscribe();
    this.onlineUserChangesSubscription.unsubscribe();
    console.log("Disconnected from easyRTC server");

  }

  private openListener(caller: string) {

    console.log(`Data channel opened with ${caller}`);
    this.onlineUsersChanges$.next({user: {easyRTCId: caller, username: easyrtc.idToName(caller)}, changeType: 'added'});

  }

  private closeListener(caller: string) {

    console.log(`Data channel closed with ${caller}`);
    this.onlineUsersChanges$.next({user: {easyRTCId: caller, username: easyrtc.idToName(caller)}, changeType: 'removed'});

  }

  private peerListener(easyrtcId:string, msgType:string, msgData:any, targetting:Easyrtc_MessageTargeting) {
    console.log(`Recieved ${msgData} from ${easyrtc.idToName(easyrtcId)}`);
    this.peerListenerEvents$.next(
      {
        user: {username: easyrtc.idToName(easyrtcId), easyRTCId: easyrtcId}, 
        msgType: msgType, 
        msgData: msgData, 
        targetting: targetting
      });
  }

  private occupantListener(_roomName: string, occupants: Easyrtc_PerRoomData, _isOwner: boolean) {

    for (var occupant in occupants) {

      let connectStatus = easyrtc.getConnectStatus(occupant);
      //If any of the occupants are not connected to us
      if (connectStatus === easyrtc.NOT_CONNECTED) {
        console.log(`Calling ${occupant} because we are not connected`);
        easyrtc.call(occupant, 
          (callee, _: 'datachannel') => {
    
            if(callee === occupant) {
              console.log(`Called occupant ${callee} successfully`);
            }
    
          },
          (err: string, errMsg: string) => {
    
            console.log(`Unable to call occupant ${easyrtc.idToName(occupant)}, error: ${err} ${errMsg}`)

          },
          null, null
          );
      }
    }
  }

  private loginSuccess(easyrtcid) {
    console.log(`Login successful, assigned ID ${easyrtcid}`);
    this.loginId$.next(easyrtc.idToName(easyrtcid));
    this.loginId$.complete();
  }

  private loginFailure(errorCode, message) {
    console.log(`Failed to login with code: ${errorCode} and message: ${message}`);
    this.connectionOpen = false;
  }
}
