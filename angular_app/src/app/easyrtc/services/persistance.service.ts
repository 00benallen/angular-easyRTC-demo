import { Injectable } from '@angular/core';
import { State, ChatMessage, Post } from './state';

const STATE_KEY = 'easyRTC-localState';

export interface PersistantState {
  room: {
    chat: ChatMessage[],
    postFeed: Post[]
  };
}

@Injectable({
  providedIn: 'root'
})
export class PersistanceService {

  constructor() { }

  public saveToLocalStorage(state: PersistantState, username: string) {

    console.log('Saving state to local storage');
    localStorage.setItem(`${STATE_KEY}-${username}`, JSON.stringify(state));

  }

  public loadFromLocalStorage(username: string): PersistantState | undefined {

    const stateJSON = localStorage.getItem(`${STATE_KEY}-${username}`);

    if (stateJSON) {
      console.log('Loading state from local storage');
      return JSON.parse(stateJSON);
    } else {
      console.log('No state in local storage, starting fresh');
      return undefined;
    }
  }
}
