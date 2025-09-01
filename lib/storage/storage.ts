


export enum STORAGE_KEY  {
    ACCOUNT = 'account',
}

export class Storage {

    static setItem<T = string>(key: STORAGE_KEY, value: string | T) {
        if (typeof window === 'undefined') return; // SSR 방지
        const toStore = typeof value === "string" ? value : JSON.stringify(value);
        localStorage.setItem(key, toStore);
    }
    
    static getItem<T = string>(key: STORAGE_KEY): T | undefined {
        if (typeof window === 'undefined') return undefined; // SSR 방지
        const item = localStorage.getItem(key);
        if (!item) return undefined;
        try {
            if(Storage.#isJson(item)) {
                return JSON.parse(item) as T;
            }
            return item as T;
        } catch(error) {
            console.error('[Storage] getItem-error : ', key, error)
        }
        return undefined;
    }

    static removeItem(key: STORAGE_KEY) {
        if (typeof window === 'undefined') return; // SSR 방지
        localStorage.removeItem(key);
    }
    static #isJson(item: string) {
        
        if (item.length > 0 && item[0] === '{' || item[0] === '[') {
            try {
                return true;
            } catch {
                return false;
            }
        }
        return false;
    }

    //==========================================================


}



// console.log('111 ', Storage.getItem('111'))
// console.log('222 ', Storage.getItem<string>('222'))
// console.log('333 ', Storage.getItem<{acd: number}>('333'))
