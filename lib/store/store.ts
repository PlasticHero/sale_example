import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
const VERSION = 1;

export const makeStore = <S, A>(
  state: S, 
  actions: (set: (fn: (state: S & A) => Partial<S & A> | Partial<S & A>) => void, get: () => S & A) => A
)=>{
  return create<S & A>()((set, get) => ({
    ...state,
    ...actions(set, get)
  }))
}


export const makeStoreStorage = <S, A>(
  storeKey: string,
  state: S, 
  actions: (set: (fn: (state: S & A) => Partial<S & A> | Partial<S & A>) => void, get: () => S & A) => A
)=>{
  return create<S & A>()(
    persist((set, get) => ({...state,...actions(set, get)}), 
    {
      name: storeKey, 
      version: VERSION,
      migrate: (persistedState: any, version: number) => {
        if (version < VERSION) {
          const validKeys = Object.keys(state as object);
          const filteredState = Object.keys(persistedState)
            .filter(key => validKeys.includes(key))
            .reduce((obj: any, key: string) => {
              obj[key] = persistedState[key];
              return obj;
            }, {});
          return filteredState
        }
        return persistedState
      },  
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state: any, error) => {
        /**스토리지 로드 이벤트(interface StoreState, StoreAction) */
        // console.log('onRehydrateStorage : ' , error)
        if(state && state.is_loaded !== undefined && state.setLoaded) {
          state.setLoaded();
        }
      }
    }
  ))
}

