import { createStore, applyMiddleware, combineReducers } from 'redux';
import createEngine from 'redux-storage-engine-localstorage';
import promiseMiddleware from 'redux-promise';
import * as storage from 'redux-storage'
import Reducers from './reducers';
import { loggerMiddleware } from "./middlewares";


const engineKey = 'myStorageKey';

export const clearStorage = (key = engineKey) => {
    localStorage.removeItem(key);
};

let reducer = combineReducers(Reducers);
reducer = storage.reducer(reducer);
const engine = createEngine(engineKey);

const storageMiddleware = storage.createMiddleware(engine);

const createStoreWithMiddleware = applyMiddleware(
        promiseMiddleware, loggerMiddleware, storageMiddleware
    )(createStore);
const store = createStoreWithMiddleware(reducer);

export default store;
STORE = store; // for debug

const load = storage.createLoader(engine);

load(store)
    .then(newState => {
        console.log('Loaded state:', newState);
    }).catch(() => console.log('Failed to load previous state'));
