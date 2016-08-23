import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';

export class HeaderDumb extends React.Component {
    render() {
        const { currentUser } = this.props;
        if (currentUser)
            var userArea = (
                <p> Client ID: {currentUser._id} </p>
            );
        return (
            <header>
                  <h1>AgentCar</h1>
            	  { userArea }
            </header>
        )
    }
}
HeaderDumb.propTypes = {
    currentUser: React.PropTypes.object
};

const Header = createContainer(() => {
    return {
        currentUser: Meteor.user()
    };
}, HeaderDumb);

export default Header
