import { Room } from '../state';
import { sync as chatSync } from './conversation.sync';
import { sync as postSync } from './posts.sync';
import { StateParameterSynchronizerMap } from './index.sync';

export const synchronizerMap: StateParameterSynchronizerMap<Room> = {
    chat: chatSync,
    localStateSynchronized: undefined,
    loggedInUser: undefined,
    onlineUsers: undefined,
    postFeed: postSync
};

export function sync(currentRoom: Room, newRoom: Room): Room {

    const syncRoom = { ...currentRoom };

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
