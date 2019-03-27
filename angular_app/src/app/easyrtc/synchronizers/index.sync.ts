import { State } from '../state';
import { sync as roomSync } from './room.sync';

export type Synchronizer<State> = (oldState: State, newState: State) => State;

export type StateParameterSynchronizerMap<State> = {
    [parameter in keyof State]: Synchronizer<State[parameter]> | undefined;
}

export const synchronizerMap: StateParameterSynchronizerMap<State> = {
    connection: undefined,
    room: roomSync
}