import { LOAD, SAVE } from 'redux-storage';

// middleware allows you to do something in between the dispatch
// and handing it off to the reducer

// console.log our state changes
export const loggerMiddleware = store => next => action => {
    let skip = action.type == SAVE || !__debug_redux;
    if (!skip)
        console.debug('[Dispatching] ', action);
    // essentially call 'dispatch'
    let result = next(action);
    if (!skip)
        console.debug('[Store] ', store.getState());
    return result;
};

export const __debug_redux = true;
