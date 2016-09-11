import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Statistics from '/imports/common/collections/Statistics';
import ReserveCars from '/imports/common/collections/ReserveCars';
import DealerSettings from '/imports/common/collections/DealerSettings';
import NegativeSubscribe from '/imports/common/collections/NegativeSubscribe';

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
    saveSettings() {
        var customCSS = this.refs.customCSS.value;
        var underElements = this.refs.underElements.value;
        var overElements = this.refs.overElements.value;
        Meteor.call('saveSettings', this.props.ownerId, { customCSS, underElements, overElements });
    }

    render() {
        const { loadingStats, loadingReserve, loadingSettings, loadingNegative,
                stats, reserveCars, settings, negativeSubscribes, ownerId } = this.props;
        if (loadingStats || loadingSettings || loadingReserve || loadingNegative)
            return <div>Loading...</div>;

        const { widgetOpen, widgetLoaded, queries, reserve, subscribe, needDetails } = stats || {};
        let { emails } = settings || {};
        emails = emails ? emails.join(', ') : 'Отсутствует';
        return (
            <div>
                <h3>Дилер {settings.mark} (id - {ownerId})</h3>
				Emails: {emails}<br />
				Цвет: {settings.color}; Расположение: {settings.position};
                Прозрачность: {settings.opacity}; Анимация: {settings.animate ? 'Да' : 'Нет'}<br />
                CustomCSS:<br />
                <textarea ref="customCSS" defaultValue={settings.customCSS} className="customCSS" />
                Виджет над элементами (CSS селекторы через запятую):<br />
                <textarea ref="underElements" defaultValue={settings.underElements} className="customCSS" />
                Виджет под элементами (CSS селекторы через запятую):<br />
                <textarea ref="overElements" defaultValue={settings.overElements} className="customCSS" />
                <input type="button" value="Сохранить" onClick={this.saveSettings.bind(this)} />
                <h4>Статистика</h4>
                Открытий/загрузок виджета: <b>{widgetOpen||0}/{widgetLoaded||0}</b><br />
				Отправлено поисковых форм: <b>{queries||0}</b><br />
				Всего заказов/узнать подробнее/подписок: <b>{reserve||0}/{needDetails||0}/{subscribe||0}</b><br />

                <h4>Заказы ({_.filter(reserveCars, car => !car.needDetails).length} + {_.filter(reserveCars, car => car.needDetails).length})</h4>
                <table><tbody>
                    <tr><th>Имя</th><th>Тел.</th><th>Email</th><th>Машина</th><th>Заказ/Узнать подробнее</th></tr>
                {reserveCars.map(({ contactInfo, car, needDetails }, i) => (
                    <tr key={i}>
                        <td>{contactInfo.name}</td>
                        <td>{contactInfo.phone}</td>
                        <td>{contactInfo.email}</td>
                        <td>{car.mark} - {car.model} ({car.price} Р)</td>
                        <td>{needDetails ? 'Узнать подробнее' : 'Заказ'}</td>
                    </tr>
                ))}
                </tbody></table>

                <h4>Не нашли, но подписались ({negativeSubscribes.length})</h4>
                <table><tbody>
                <tr><th>Имя</th><th>Тел.</th><th>Email</th><th>Параметры поиска</th></tr>
                {negativeSubscribes.map(({ contactInfo, searchParams }, i) => (
                    <tr key={i}>
                        <td>{contactInfo.name}</td>
                        <td>{contactInfo.phone}</td>
                        <td>{contactInfo.email}</td>
                        <td>{JSON.stringify(searchParams)}</td>
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
    const negativeSubscribeHandle = Meteor.subscribe('NegativeSubscribe', dealerId);

    return {
        loadingStats: !statisticsHandle.ready(),
        loadingReserve: !reserveCarsHandle.ready(),
        loadingSettings: !dealerSettingsHandle.ready(),
        loadingNegative: !negativeSubscribeHandle.ready(),
        stats: Statistics.findOne({ ownerId: dealerId }),
        settings: DealerSettings.findOne({ ownerId: dealerId }),
        reserveCars: ReserveCars.find({ ownerId: dealerId }).fetch(),
        negativeSubscribes: NegativeSubscribe.find({ ownerId: dealerId }).fetch(),
        ownerId: dealerId
    };
}, TestWidgetPageDumb);

export default TestWidgetPage