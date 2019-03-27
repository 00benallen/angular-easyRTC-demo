import { State, ChatMessage } from "../state";

export function sync(currentState: State, newState: State): State {

    let syncedMessagesOfNew = 0;

    let currentChat = currentState.room.chat;
    let newChat = newState.room.chat;

    if(currentChat.length === 0) {
        currentState.room.chat = newChat;
        return currentState;
    } 

    if(newChat.length === 0) {
        return currentState;
    }

    let syncChat = removeDuplicates(currentChat.concat(newChat)).sort((a: ChatMessage, b: ChatMessage) => {
        return new Date(a.sentTime).getTime() - new Date(b.sentTime).getTime();
    });

    currentState.room.chat = syncChat;

    console.log('Chats synchronized: ');
    console.log("Local chat was: ", currentChat);
    console.log("Peer's chat was: ", newState.room.chat);
    console.log("Synced chat is: ", syncChat);

    return currentState;

}

function removeDuplicates(chatMessages: ChatMessage[]) {
    let uniqueIDs: string[] = [];
    var uniqueMessages: ChatMessage[] = [];
    for(var i = 0; i < chatMessages.length; i++){
        if(uniqueIDs.indexOf(chatMessages[i].id) == -1){
            uniqueMessages.push(chatMessages[i]);
            uniqueIDs.push(chatMessages[i].id);
        }
    }
    return uniqueMessages;
}