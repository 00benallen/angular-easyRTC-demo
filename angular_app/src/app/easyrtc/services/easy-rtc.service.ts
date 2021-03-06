// This gives us access to the static type declarations given by easyRTC
/// <reference path="../../../../node_modules/easyrtc/typescript_support/d.ts.files/client/easyrtc.d.ts" />

/**
 * Imports
 */
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { State, User } from './state';
import { Subscription } from 'rxjs';
import { StateService, initialState } from './state.service';
import { PersistanceService } from './persistance.service';

/**
 * The socket.io.js and easyrtc.js files expose these two global variables,
 * here we try to grab them from the window
 */
export const io = window['io'];

export enum MessageType {
  SEND_SYNC = 'SEND_SYNC',
  RECV_SYNC = 'RECV_SYNC'
}

/**
 * Service for accessing basic features in easyRTC, setup for data channels (no audio/video)
 */
@Injectable({
  providedIn: 'root'
})
export class EasyRTCService {

  private currentState: State;
  private stateSubscription: Subscription;

  private sendSyncWaitingUsers: string[];

  constructor(
    private stateService: StateService,
    private persistanceService: PersistanceService) {

    this.currentState = initialState;
    this.sendSyncWaitingUsers = [];

    this.stateSubscription = stateService.stateEvents$.subscribe((state) => {

      this.currentState = state;

      if (state.connection.newcomer) {
        for (const user of state.room.onlineUsers) {

          console.log('Sending request for state sync as newcomer from user: ', user);

          easyrtc.sendDataP2P(user.easyRTCId, MessageType.RECV_SYNC, undefined);

        }

      } else if (!state.room.localStateSynchronized) {

        console.log('Local state needs synchronizing with peers, sending local state to all peers');

        for (const user of state.room.onlineUsers) {

          easyrtc.sendDataP2P(user.easyRTCId, MessageType.SEND_SYNC, state);

        }

      }
    });

    if (!io) {
      throw new Error('Socket.io could not be obtained from global script, easyRTC server may not be connected');
    }

    if (!easyrtc) {
      throw new Error('EasyRTC could not be obtained from global script, easyRTC server may not be connected');
    }

    const socket = io.connect(environment.easyRTCServer);
    easyrtc.useThisSocketConnection(socket);
  }

  public configureEasyRTCForData(username: string) {
    easyrtc.enableDebug(false);
    easyrtc.enableDataChannels(true);
    easyrtc.enableVideo(false);
    easyrtc.enableAudio(false);
    easyrtc.enableVideoReceive(false);
    easyrtc.enableAudioReceive(false);
    easyrtc.setDataChannelOpenListener(this.openListener.bind(this));
    easyrtc.setDataChannelCloseListener(this.closeListener.bind(this));
    easyrtc.setPeerListener(this.peerListener.bind(this));
    easyrtc.setRoomOccupantListener(this.occupantListener.bind(this));
    if (username) {
      easyrtc.setUsername(username);
    }
    easyrtc.connect('easyrtc.dataMessaging', this.loginSuccess.bind(this), this.loginFailure.bind(this));

    this.stateService.pushNewState({
      connection: {
        ...this.currentState.connection,
        open: true
      },
      room: { ...this.currentState.room }
    });

    console.log('Connected to easyRTC server');
  }

  public close() {

    easyrtc.disconnect();
    io.disconnect();

    this.stateService.pushNewState({
      connection: {
        ...this.currentState.connection,
        open: false
      },
      room: { ...this.currentState.room }
    });
    this.stateSubscription.unsubscribe();
    console.log('Disconnected from easyRTC server');

  }

  private openListener(caller: string) {

    console.log(`Data channel opened with ${caller}`);

    const newUser = {
      easyRTCId: caller,
      username: easyrtc.idToName(caller)
    };

    this.currentState.room.onlineUsers.push(newUser);

    console.log('Adding user to list of online users: ', newUser);
    this.stateService.pushNewState({
      connection: { ...this.currentState.connection },
      room: {
        ...this.currentState.room,
        onlineUsers: this.currentState.room.onlineUsers,
      }
    });

    if (this.sendSyncWaitingUsers.includes(caller)) {
      console.log(`Caller ${caller} was waiting for synchronization, sending now`);
      this.sendSyncDataToRequestingPeer(caller);
    }
  }

  private closeListener(caller: string) {

    console.log(`Data channel closed with ${caller}`);

    console.log(`Removing ${caller} from list of online users`);

    const index = this.currentState.room.onlineUsers.map(user => user.easyRTCId).indexOf(caller, 0);
    if (index > -1) {
      this.currentState.room.onlineUsers.splice(index, 1);
    }

    this.stateService.pushNewState({
      room: {
        ...this.currentState.room,
        onlineUsers: this.currentState.room.onlineUsers,
      },
      connection: { ...this.currentState.connection }
    });
  }

  private peerListener(easyrtcId: string, msgType: string, msgData: State | undefined, targetting: Easyrtc_MessageTargeting) {
    console.log(`Recieved ${msgType} message from ${easyrtc.idToName(easyrtcId)}`);

    if (msgType === MessageType.SEND_SYNC) {
      console.log('Recieved state from peer: ');
      console.log(msgData);

      if (msgData) {
        this.stateService.syncState(this.currentState, msgData);

        console.log('State synchronized with peer, no longer newcomer');
        this.stateService.pushNewState({
          room: { ...this.currentState.room },
          connection: {
            ...this.currentState.connection,
            newcomer: false
          }
        });
      } else {
        console.error('Recieved SEND_SYNC message to synchronize state with peer, but no new state recieved');
      }
    }

    if (msgType === MessageType.RECV_SYNC) {

      this.sendSyncDataToRequestingPeer(easyrtcId);

    }
  }

  private sendSyncDataToRequestingPeer(peerId: string) {
    const onlineEasyRTCIds = this.currentState.room.onlineUsers.map(user => user.easyRTCId);

      if (onlineEasyRTCIds.includes(peerId)) {
        console.log(`Peer ${peerId} requested state update, sending state`);
        easyrtc.sendDataP2P(peerId, MessageType.SEND_SYNC, this.currentState);

        // remove user from waiting list
        const index = this.sendSyncWaitingUsers.indexOf(peerId, 0);
        if (index > -1) {
          this.sendSyncWaitingUsers.splice(index, 1);
        }
      } else {
        console.log(`Data stream not ready to send state sync to peer, queuing`);

        // add user to waiting list
        this.sendSyncWaitingUsers.push(peerId);
      }
  }

  private occupantListener(_roomName: string, occupants: Easyrtc_PerRoomData, _isOwner: boolean) {

    if (this.currentState.connection.newcomer) {
      for (const occupant in occupants) {

        if (occupants.hasOwnProperty(occupant)) {
          const connectStatus = easyrtc.getConnectStatus(occupant);
          // If any of the occupants are not connected to us
          if (connectStatus === easyrtc.NOT_CONNECTED) {
            console.log(`Calling ${occupant} because we are not connected`);
            easyrtc.call(occupant,
              (callee, mediaType: string) => {

                if (callee === occupant && mediaType === 'datachannel') {
                  console.log(`Called occupant ${callee} successfully`);
                }

              },
              (err: string, errMsg: string) => {

                console.log(`Unable to call occupant ${easyrtc.idToName(occupant)}, error: ${err} ${errMsg}`);

              },
              () => {}, []
              );
          }
        }
      }
    }
  }

  private loginSuccess(easyrtcid: string) {

    console.log(`Login successful, assigned ID ${easyrtcid}`);

    const loggedInUser = this.buildUser(easyrtcid);
    const localStorageState = this.persistanceService.loadFromLocalStorage(loggedInUser.username);

    if (localStorageState) {

      const initialStateWithPersistantFields = { 
        connection: {
          open: true,
          newcomer: true
        },
        room: {
          ...localStorageState.room,
          onlineUsers: [],
          localStateSynchronized: false
        }
      };

      this.stateService.pushNewState({
        room: {
          ...initialStateWithPersistantFields.room,
          loggedInUser: loggedInUser
  
        },
        connection: {
          ...initialStateWithPersistantFields.connection
        }
      });
    } else {
      this.stateService.pushNewState({
        room: {
          ...this.currentState.room,
          loggedInUser: loggedInUser
  
        },
        connection: {
          ...this.currentState.connection
        }
      });
    }

    
  }

  private loginFailure(errorCode, message) {
    console.log(`Failed to login with code: ${errorCode} and message: ${message}`);
    this.stateService.pushNewState({
      room: {
        ...this.currentState.room
      },
      connection: {
        ...this.currentState.connection,
        open: false
      }
    });
  }

  public buildUser(easyRTCId?: string, username?: string): User {
    if (easyRTCId) {
      return {
        easyRTCId: easyRTCId,
        username: easyrtc.idToName(easyRTCId)
      };
    } else if (username) {
      return {
        easyRTCId: easyrtc.usernameToIds(username, 'default')[0],
        username: username
      };
    } else {
      return {
        easyRTCId: '',
        username: ''
      };
    }
  }
}
