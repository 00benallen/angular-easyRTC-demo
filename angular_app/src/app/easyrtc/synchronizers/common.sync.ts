/**
 * Common functions to assist with synchronization
 */

 /**
  * Interface guaranteeing type has an id parameter, assuming it is unique
  * 
  * Recommended: generate this id using `uuid` library
  */
export interface UniqueId {
    id: string;
}

/**
 * Remove chatMessages with duplicate IDs, always taking the first one
 * @param chatMessages - messages to remove duplicates from
 */
export function removeDuplicates(items: UniqueId[]): UniqueId[] {
    const uniqueIDs: string[] = [];
    const uniqueItems: UniqueId[] = [];
    for (let i = 0; i < items.length; i++) {
        if (uniqueIDs.indexOf(items[i].id) === -1) {
            uniqueItems.push(items[i]);
            uniqueIDs.push(items[i].id);
        }
    }
    return uniqueItems;
}
