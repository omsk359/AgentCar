import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Statistics from '/imports/common/collections/Statistics';
import ReserveCars from '/imports/common/collections/ReserveCars';
import DealerSettings from '/imports/common/collections/DealerSettings';

import '../css/test.css';

export default class TestWidgetPageDumb extends React.Component {
    componentWillMount() {
        const script = document.createElement('script');

        script.src = window.location.origin + '/agentcar.js';
        script.async = true;
        Object.assign(script, { type: 'text/javascript', charset: 'UTF-8' });
        script.setAttribute('data-id', this.props.ownerId);

        document.body.appendChild(script);
    }
    render() {
        const { loadingStats, loadingReserve, loadingSettings, stats, reserveCars, settings, ownerId } = this.props;
        if (loadingStats || loadingSettings)
            return <div>Loading...</div>;

        const { widgetOpen, widgetLoaded, queries, reserve } = stats || {};
        let { emails } = settings || {};
        emails = emails ? emails.join(', ') : 'Отсутствует';
        return (
            <div>
                <h3>Дилер {settings.mark} (id - {ownerId})</h3>
				Emails: {emails}<br />
				CustomCSS: <br /><i>{settings.customCSS}</i><br />
                <h4>Статистика</h4>
                Открытий/загрузок виджета: <b>{widgetOpen||0}/{widgetLoaded||0}</b><br />
				Отправлено поисковых форм: <b>{queries||0}</b><br />
				Всего заказов: <b>{reserve||0}</b><br />

                <h4>Заказы ({reserveCars.length})</h4>
                <table><tbody>
                    <tr><th>Имя</th><th>Тел.</th><th>Email</th><th>Машина</th></tr>
                {reserveCars.map(({ contactInfo, car }, i) => (
                    <tr key={i}>
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
    const dealerSettingsHandle = Meteor.subscribe('DealerSettings', dealerId);

    return {
        loadingStats: !statisticsHandle.ready(),
        loadingReserve: !reserveCarsHandle.ready(),
        loadingSettings: !dealerSettingsHandle.ready(),
        stats: Statistics.findOne({ ownerId: dealerId }),
        settings: DealerSettings.findOne({ ownerId: dealerId }),
        reserveCars: ReserveCars.find({ ownerId: dealerId }).fetch(),
        ownerId: dealerId
    };
}, TestWidgetPageDumb);

export default TestWidgetPage