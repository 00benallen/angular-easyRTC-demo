import { ChatMessage } from "../state";

export function sync(currentChat: ChatMessage[], newChat: ChatMessage[]): ChatMessage[] {

    if(currentChat.length === 0) {
        return newChat;
    } 

    if(newChat.length === 0) {
        return currentChat;
    }

    let syncChat = removeDuplicates(currentChat.concat(newChat)).sort((a: ChatMessage, b: ChatMessage) => {
        return new Date(a.sentTime).getTime() - new Date(b.sentTime).getTime();
    });

    return syncChat;

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