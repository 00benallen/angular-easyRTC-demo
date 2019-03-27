import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

export interface User {
    easyRTCId: string;
    username: string;
}

export interface ChatMessage {
    id: string;
    author: User;
    content: string;
    sentTime: Date;
}

export interface Post {
    id: string;
    postTime: Date;
    title: string;
    author: User;
    content: string;
}

export interface Room {
    loggedInUser?: User;
    onlineUsers: User[];
    chat: ChatMessage[];
    postFeed: Post[];
    localStateSynchronized: boolean;
}

export interface Connection {
    open: boolean;
    newcomer: boolean;
}

export interface State {
    room: Room;
    connection: Connection;
}
  
const initialRoomState: Room = {
    chat: [],
    localStateSynchronized: false,
    loggedInUser: undefined,
    onlineUsers: [],
    postFeed: []
}

const initialConnectionState: Connection = {
    newcomer: true,
    open: false
}

export const initialState: State = {
    room: initialRoomState,
    connection: initialConnectionState
}

@Injectable({
    providedIn: 'root'
})
export class StateService {
    
    stateEvents$: BehaviorSubject<State> = new BehaviorSubject<State>(initialState);

    pushNewState(state: State, needsResync: boolean = false) {

        console.log(`Local state updated with resync flag ${needsResync}: `);
        console.log(state);

        state.room.localStateSynchronized = !needsResync;

        this.stateEvents$.next(state);
    }

}

