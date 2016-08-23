// action creators are functions that take a param and return
// an 'action' that is consumed by a reducer. This may seem like
// unneeded boilerplate  but it's **really** nice to have a file
// with *all* possible ways to mutate the state of the app.

import { createAction, handleAction, handleActions } from 'redux-actions';

export const ActionTypes = {
    CARS: {
        ADD: 'CARS.ADD',
        REMOVE: 'CARS.REMOVE'
    },
};

const Actions = {
    cars: {
        add: createAction(ActionTypes.CARS.ADD, params => {
            return Meteor.callPromise('cars.add', taskName, params).then(taskId => {
                console.log(`Added car! ${taskId}`);
                //return taskId;
            }, err => {
                console.error(`create task: ${err.message}`);
            });
        })
    },
};
export default Actions
