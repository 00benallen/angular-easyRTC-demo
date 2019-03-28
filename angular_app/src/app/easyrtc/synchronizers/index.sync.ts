/**
 * Root file for state synchronizer system
 *
 * The synchronizer map exported here should be all that is needed to run any synchronizers
 * mapped to the parameters of the application state
 *
 * This is a generic and extendable way of synchronizing the current local state with any recieved
 * state object from the P2P network, using whatever logic is appropriate
 */

import { State } from '../state';
import { sync as roomSync } from './room.sync';

/**
 * Synchronizers are pure functions, they should recieve 2 objects of the same type, and then return one object
 * of that type.
 *
 * They can concievably to anything with these two objects, but the intention is for them to logically
 * return a new state that is the synchronized state between the old local state and the new state recieved from
 * a Peer on the network
 */
export type Synchronizer<TypeToSync> = (oldState: TypeToSync, newState: TypeToSync) => TypeToSync;

/**
 * Map with 0 or 1 synchronizers for each parameter in the Type intended to be synchronized
 */
export type StateParameterSynchronizerMap<TypeToSync> = {
    [parameter in keyof TypeToSync]: Synchronizer<TypeToSync[parameter]> | undefined;
};

/**
 * Synchronizer map for the application state, using the actual state object defined in state.ts
 */
export const synchronizerMap: StateParameterSynchronizerMap<State> = {
    connection: undefined,
    room: roomSync
};
