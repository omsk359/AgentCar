import './accounts-config';

import { render } from 'react-dom';
import React from 'react';
import { Routes } from '/imports/client/components/AppRoutes';
import { Provider } from 'react-redux';
import store from '/imports/client/redux/store';
import injectTapEventPlugin from 'react-tap-event-plugin';

import '/imports/client/css/main.css'

Meteor.startup(function() {
    injectTapEventPlugin();
    render(
        <Provider store={store}>
            <Routes />
        </Provider>,
    document.getElementById("container"));
    // render((
    //     <Provider store={store}>
    //         <Routes />
    //     </Provider>
    // ), document.getElementById("container"));
});
