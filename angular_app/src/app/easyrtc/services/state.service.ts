import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { synchronizerMap } from '../synchronizers/index.sync';
import { State, Connection, Room } from './state';
import { PersistanceService } from './persistance.service';

const initialRoomState: Room = {
    chat: [],
    localStateSynchronized: false,
    loggedInUser: undefined,
    onlineUsers: [],
    postFeed: []
};

const initialConnectionState: Connection = {
    newcomer: true,
    open: false
};

export const initialState: State = {
    room: initialRoomState,
    connection: initialConnectionState
};

@Injectable({
    providedIn: 'root'
})
export class StateService {

    constructor(private persistanceService: PersistanceService) { }

    stateEvents$: BehaviorSubject<State> = new BehaviorSubject<State>(initialState);

    pushNewState(state: State, needsResync: boolean = false) {

        console.log(`Local state updated with resync flag ${needsResync}: `);
        console.log(state);

        state.room.localStateSynchronized = !needsResync;

        this.stateEvents$.next(state);

        if (state.room.loggedInUser) {
            this.persistanceService.saveToLocalStorage(state, state.room.loggedInUser.username);
        }
        
    }

    syncState(oldState: State, newState: State) {

        const syncState = { ...oldState };

        console.log('Synchronizing state using synchronizer map');
        if (synchronizerMap.connection) {
            syncState.connection = synchronizerMap.connection(oldState.connection, newState.connection);
        } else if (synchronizerMap.room) {
            syncState.room = synchronizerMap.room(oldState.room, newState.room);
        }

        console.log('Pushing synchronized state in local state');
        this.pushNewState({
            ...syncState,
            room: {
                ...syncState.room,
                localStateSynchronized: true
            }
        });

    }

}

