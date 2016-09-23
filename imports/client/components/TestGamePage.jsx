import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import GameSubscribers from '/imports/common/collections/GameSubscribers';
import { getResult } from '/imports/client/game/helpers';

export default class TestGamePageDumb extends React.Component {
    componentWillMount() {
        const script = document.createElement('script');

        script.src = window.location.origin + '/game.js';
        script.async = true;
        Object.assign(script, { type: 'text/javascript', charset: 'UTF-8' });
        script.setAttribute('data-id', this.props.ownerId);

        document.body.appendChild(script);
    }

    render() {
        const { loadingSubscribers, subscribers, ownerId } = this.props;
        if (loadingSubscribers)
            return <div>Loading...</div>;

        return (
            <div>
                <h4>Игра ({ownerId}): пользователи оставившие информацию ({subscribers.length})</h4>
                <table><tbody>
                <tr><th>Имя</th><th>Тел.</th><th>Email</th><th>Результат</th></tr>
                {subscribers.map(({ contactInfo, resultType }, i) => (
                    <tr key={i}>
                        <td>{contactInfo.name}</td>
                        <td>{contactInfo.phone}</td>
                        <td>{contactInfo.email}</td>
                        <td>{getResult(resultType)}</td>
                    </tr>
                ))}
                </tbody></table>
            </div>
        )
    }
}

const TestGamePage = createContainer(props => {
    const { dealerId } = props.params;
    const subscribersHandle = Meteor.subscribe('GameSubscribers', dealerId);

    return {
        loadingSubscribers: !subscribersHandle.ready(),
        subscribers: GameSubscribers.find({ ownerId: dealerId }).fetch(),
        ownerId: dealerId
    };
}, TestGamePageDumb);

export default TestGamePage
