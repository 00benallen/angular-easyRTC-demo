import { ChatMessage } from '../services/state';
import { removeDuplicates } from './common.sync';

/**
 * Synchronize two chat feeds
 * @param currentChat - local storage of chat
 * @param newChat - new chat from peer
 */
export function sync(currentChat: ChatMessage[], newChat: ChatMessage[]): ChatMessage[] {

    if (currentChat.length === 0) {
        return newChat;
    }

    if (newChat.length === 0) {
        return currentChat;
    }

    /**
     * Combine all chat together, remove duplicates, sort by date-time
     */
    const combinedChat = currentChat.concat(newChat);
    const uniqueCombinedChat = removeDuplicates(combinedChat) as ChatMessage[];
    const syncedChat = uniqueCombinedChat.
    sort((a: ChatMessage, b: ChatMessage) => { // sort by date-time, old to new
        return new Date(a.sentTime).getTime() - new Date(b.sentTime).getTime();
    });
    

    return syncedChat;

}
