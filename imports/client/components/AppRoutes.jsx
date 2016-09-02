import { Router, Route, IndexRedirect, IndexLink, Link, browserHistory } from 'react-router';
import { Accounts, STATES } from 'meteor/std:accounts-ui';
import React from 'react';
import About from './About';
import Header from './Header';
import CarsTable from './CarsTable';
import WidgetCode from './WidgetCode';
import TestWidgetPage from './TestWidgetPage';

const requireAuth = (nextState, replace) => {
    if (!Meteor.userId())
        replace({ nextPathname: nextState.location.pathname }, '/login')
};

export class Routes extends React.Component {
    render() {
        return (
            <Router history={browserHistory}>
                <Route path="/" component={AppRoot}>
                    <IndexRedirect to="/about" />
                    <Route path="login" component={ Accounts.ui.LoginForm } formState={ STATES.SIGN_IN } />
                    <Route path="signup" component={ Accounts.ui.LoginForm } formState={ STATES.SIGN_UP } />
                    <Route path="cars" component={CarsPage} onEnter={requireAuth} />
                    <Route path="about" component={About} />
                    <Route path="test-widget/:dealerId" component={TestWidgetPage} />
                </Route>
            </Router>
        )
    }
}

class AppRoot extends React.Component {
    render() {
        return (
            <div>
                <Header />
                { this.props.children }
            </div>
        );
    }
}

// TODO: redux connect()
class CarsPage extends React.Component {
    render() {
        return (
            <div>
                <CarsTable />
                <WidgetCode />
            </div>
        );
    }
}
