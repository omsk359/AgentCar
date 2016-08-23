import { ActionTypes } from "./actions";

var Reducers = {};

Reducers.cars = (state = [], action) => {
    const types = ActionTypes.TASK_CREATOR;
    switch (action.type) {
        case ActionTypes.CARS.ADD:
            return [...state, actions.payload];
        default:
            return state;
    }
};

export default Reducers;
