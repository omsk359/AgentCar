import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Statistics from '/imports/common/collections/Statistics';
import ReserveCars from '/imports/common/collections/ReserveCars';

export default class TestWidgetPageDumb extends React.Component {
    componentWillMount() {
        const script = document.createElement('script');

        script.src = '/agentcar.js';
        script.async = true;
        Object.assign(script, { type: 'text/javascript', charset: 'UTF-8' });
        script.setAttribute('data-id', this.props.ownerId);

        document.body.appendChild(script);
    }
    render() {
        const { loadingStats, loadingReserve, stats, reserveCars, ownerId } = this.props;
        if (loadingStats)
            return <div>Loading...</div>;

        const { widgetOpen, widgetLoaded, queries } = stats || {};
        return (
            <div>
                <h3>Статистика дилера (id - {ownerId})</h3><br />
                Открытий/загрузок виджета: {widgetOpen||0}/{widgetLoaded||0}<br />
                Отправлено форм: {queries||0}<br /><br />

                <h3>Заказы:</h3>
                <table><tbody>
                    <tr><th>Имя</th><th>Тел.</th><th>Email</th><th>Машина</th></tr>
                {reserveCars.map(({ contactInfo, car }) => (
                    <tr>
                        <td>{contactInfo.name}</td>
                        <td>{contactInfo.phone}</td>
                        <td>{contactInfo.email}</td>
                        <td>{car.mark} - {car.model} ({car.price} Р)</td>
                    </tr>
                ))}
                </tbody></table>
            </div>
        )
    }
}
// TestWidgetPageDumb.propTypes = {
//     reserveCars: React.PropTypes.array,
//     stats: React.PropTypes.object
// };

const TestWidgetPage = createContainer(props => {
    const { dealerId } = props.params;
    const statisticsHandle = Meteor.subscribe('statistics', dealerId);
    const reserveCarsHandle = Meteor.subscribe('ReserveCars', dealerId);

    return {
        loadingStats: !statisticsHandle.ready(),
        loadingReserve: !reserveCarsHandle.ready(),
        stats: Statistics.findOne({ _id: dealerId }),
        reserveCars: ReserveCars.find({ _id: dealerId }).fetch(),
        ownerId: dealerId
    };
}, TestWidgetPageDumb);

export default TestWidgetPage