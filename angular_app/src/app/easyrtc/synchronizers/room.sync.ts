import { Room } from '../services/state';
import { sync as chatSync } from './conversation.sync';
import { sync as postSync } from './posts.sync';
import { StateParameterSynchronizerMap } from './index.sync';

/**
 * Synchronizer map for a Room object, intended for use by a parent synchronizer map, but not essential
 */
export const synchronizerMap: StateParameterSynchronizerMap<Room> = {
    chat: chatSync,
    localStateSynchronized: undefined,
    loggedInUser: undefined,
    onlineUsers: undefined,
    postFeed: postSync
};

/**
 * Synchronize two room objects
 * @param currentRoom - local room
 * @param newRoom - room from Peer
 */
export function sync(currentRoom: Room, newRoom: Room): Room {

    const syncRoom = { ...currentRoom };

    /**
     * Defer all synchronization logic to sub-synchronizers
     */

    if (synchronizerMap.chat) {
        syncRoom.chat = synchronizerMap.chat(currentRoom.chat, newRoom.chat);
    }

    if (synchronizerMap.localStateSynchronized) {
        syncRoom.localStateSynchronized = synchronizerMap
        .localStateSynchronized(currentRoom.localStateSynchronized, newRoom.localStateSynchronized);
    }

    if (synchronizerMap.loggedInUser) {
        syncRoom.loggedInUser = synchronizerMap
        .loggedInUser(currentRoom.loggedInUser, newRoom.loggedInUser);
    }

    if (synchronizerMap.onlineUsers) {
        syncRoom.onlineUsers = synchronizerMap.onlineUsers(currentRoom.onlineUsers, newRoom.onlineUsers);
    }

    if (synchronizerMap.postFeed) {
        syncRoom.postFeed = synchronizerMap.postFeed(currentRoom.postFeed, newRoom.postFeed);
    }

    return syncRoom;
}
