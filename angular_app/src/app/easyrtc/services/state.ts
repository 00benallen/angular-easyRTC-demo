import { UniqueId } from '../synchronizers/common.sync';

export interface User {
    easyRTCId: string;
    username: string;
}

export interface ChatMessage extends UniqueId {
    id: string;
    author: User;
    content: string;
    sentTime: Date;
}

export interface Post extends UniqueId {
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