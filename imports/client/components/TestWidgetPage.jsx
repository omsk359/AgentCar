import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Statistics from '/imports/common/collections/Statistics';
import ReserveCars from '/imports/common/collections/ReserveCars';
import DealerSettings from '/imports/common/collections/DealerSettings';
import NegativeSubscribe from '/imports/common/collections/NegativeSubscribe';
import QueriesHistory from '/imports/common/collections/QueriesHistory';
import { toMoskowTime, getCurrentStats } from '/imports/common/helpers';
import classNames from 'classnames'
import moment from 'moment';
import _ from 'lodash';

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

    statsHistoryToTree(statsHistory) {
        // statsHistory = [
        //     { open: 0, lock: 0, kek: 0, date: moment('2015-12-30 00:04').toDate() },
        //     { open: 1, lock: 0, kek: 0, date: moment('2015-12-30 09:04').toDate() },
        //     { open: 2, lock: 0, kek: 0, date: moment('2015-12-30 10:32').toDate() },
        //     { open: 2, lock: 1, kek: 0, date: moment('2015-12-31 15:01').toDate() },
        //     { open: 2, lock: 1, kek: 1, date: moment('2015-12-31 22:35').toDate() },
        //     { open: 3, lock: 1, kek: 1, date: moment('2015-12-31 22:40').toDate() },
        //     { open: 3, lock: 1, kek: 2, date: moment('2016-01-02 01:40').toDate() },
        //     { open: 3, lock: 2, kek: 2, date: moment('2016-01-05 01:45').toDate() },
        //     { open: 3, lock: 3, kek: 2, date: moment('2016-01-06 00:01').toDate() },
        //     { open: 4, lock: 3, kek: 2, date: moment('2016-02-02 00:01').toDate() },
        // ];
        let hist = statsHistory.map(item => _.mapKeys(item, (cnt, field) => ({
            widgetOpen: 'Открытия',
            widgetLoaded: 'Загрузки',
            resultLocks: 'Поиск[тел.]',
            queries: 'Поиск',
            reserve: 'Заявки',
            needDetails: 'Подробнее',
            subscribe: 'Подписки',
            date: 'date'
        }[field])));
        console.log('TRANSLATE: ', hist);

        hist.sort((a, b) => moment(b.date).isBefore(a.date));
        let prevItem = hist.shift();
        let res = {
          title: 'История статистики',
          childNodes: []
        };
        hist.forEach(item => { 
            console.log('-- ', item);
            let date = moment(item.date);
            let treeYear = _.find(res.childNodes, child => child.title.startsWith(date.format('YYYY')));
            if (!treeYear) {
                res.childNodes.push({ title: `${date.format('YYYY')} ()`, childNodes: [] });
                treeYear = _.last(res.childNodes);
            }
            let treeMonth = _.find(treeYear.childNodes, child => child.title.startsWith(date.format('MM')));
            if (!treeMonth) {
                treeYear.childNodes.push({ title: `${date.format('MM')} ()`, childNodes: [] });
                treeMonth = _.last(treeYear.childNodes);
            }
            let treeDay = _.find(treeMonth.childNodes, child => child.title.startsWith(date.format('DD')));
            if (!treeDay) {
                treeMonth.childNodes.push({ title: `${date.format('DD')} ()`, childNodes: [] });
                treeDay = _.last(treeMonth.childNodes);
            }
            let hoursRange = `${date.format('HH')}-${_.padStart(date.hour()+1, 2, '0')}`;
            let treeHour = _.find(treeDay.childNodes, child => child.title.startsWith(hoursRange));
            if (!treeHour) {
                treeDay.childNodes.push({ title: `${hoursRange} ()` });
                treeHour = _.last(treeDay.childNodes);
            }

            let field = _.findKey(item, (cnt, field) => prevItem[field] != cnt && field != 'date');

            let incFieldInTitle = treeNode => {
                let fieldCntRe = new RegExp(`${field} \\+(\\d+)`);
                let match = treeNode.title.match(fieldCntRe);
                if (!match)
                    treeNode.title = treeNode.title.replace(/\)/, ` ${field} +1 ) `);
                else
                    treeNode.title = treeNode.title.replace(fieldCntRe, `${field} +${+match[1]+1}`);
            };
            incFieldInTitle(treeYear);
            incFieldInTitle(treeMonth);
            incFieldInTitle(treeDay);
            incFieldInTitle(treeHour);

            prevItem = item;
        });
        console.log('statsHist tree: ', res);

        return res;
    }

    render() {

        const { loadingStats, loadingReserve, loadingSettings, loadingNegative, loadingQueriesHistory,
                stats, statsHistory, reserveCars, settings, negativeSubscribes, ownerId, queriesHistory = [] } = this.props;
        if (loadingStats || loadingSettings || loadingReserve || loadingNegative)
            return <div>Loading...</div>;
        console.log('statsHistory: ', statsHistory);

        const { widgetOpen, widgetLoaded, queries, reserve, subscribe, needDetails, resultLocks } = stats || {};
        let { emails, emails_secondHand } = settings || {};
        emails = emails ? emails.join(', ') : 'Отсутствует';
        emails_secondHand = emails_secondHand ? emails_secondHand.join(', ') : 'Отсутствует';
        return (
            <div>
                <h3>{settings.placementType == 'partner' ? 'Партнер' : 'Дилер'} "{settings.name}" ({settings.mark}) (id - {ownerId})</h3>
				Emails: {emails}<br />
				Emails (б/у): {emails_secondHand}<br />
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
				Отправлено поисковых форм (с тел./всего): <b>{resultLocks||0}/{queries||0}</b><br />
				Всего заказов/узнать подробнее/подписок: <b>{reserve||0}/{needDetails||0}/{subscribe||0}</b><br />

                <TreeNode node={this.statsHistoryToTree(statsHistory)} />

                <h4>Поисковые запросы ({queriesHistory.length})</h4>
                <table><tbody>
                <tr>
                    <th>Тел. ({_.filter(queriesHistory, 'contactInfo').length})</th><th>Имя</th>
                    <th>Дата</th><th>Марка - Модель</th><th>У меня есть</th><th>Кредит</th>
                    <th>Trade In</th><th>Б/у</th><th>Результат</th>
                </tr>
                {queriesHistory.map(({
                    ownerId, result = [], contactInfo = {}, createdAt,
                    query: {
                        mark, model, ac_form_i_have, ac_form_credit_pay, ac_form_credit_time,
                        ac_form_car_cost, ac_form_secondhand
                    }
                }, i) => (
                    <tr key={i}>
                        <td>{contactInfo.phone || '-'}</td>
                        <td>{contactInfo.name || '-'}</td>
                        <td>{createdAt ? toMoskowTime(createdAt).format('MM.DD HH:mm') : '-'}</td>
                        <td>{mark} - {model}</td>
                        <td>{ac_form_i_have}</td>
                        <td>{ac_form_credit_pay ? `${ac_form_credit_pay} на ${ac_form_credit_time} мес` : '-'}</td>
                        <td>{ac_form_car_cost || '-'}</td>
                        <td>{ac_form_secondhand ? '+' : '-'}</td>
                        <td>{result.length}</td>
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


                <h4>Заказы ({_.filter(reserveCars, car => !car.needDetails).length} +
                            {_.filter(reserveCars, car => car.needDetails).length})
                </h4>
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
    const statisticsHandle = Meteor.subscribe('statisticsHistory', dealerId);
    const reserveCarsHandle = Meteor.subscribe('ReserveCars', dealerId);
    const dealerSettingsHandle = Meteor.subscribe('DealerSettings', dealerId);
    const negativeSubscribeHandle = Meteor.subscribe('NegativeSubscribe', dealerId);
    const queriesHistoryHandle = Meteor.subscribe('QueriesHistory', dealerId);

    return {
        loadingStats: !statisticsHandle.ready(),
        loadingReserve: !reserveCarsHandle.ready(),
        loadingSettings: !dealerSettingsHandle.ready(),
        loadingNegative: !negativeSubscribeHandle.ready(),
        loadingQueriesHistory: !queriesHistoryHandle.ready(),
        // stats: Statistics.findOne({ ownerId: dealerId }),
        stats: getCurrentStats(dealerId),
        statsHistory: Statistics.find({ ownerId: dealerId }).fetch().map(st => _.omit(st, ['_id', 'ownerId'])),
        settings: DealerSettings.findOne({ ownerId: dealerId }),
        reserveCars: ReserveCars.find({ ownerId: dealerId }).fetch(),
        negativeSubscribes: NegativeSubscribe.find({ ownerId: dealerId }).fetch(),
        queriesHistory: QueriesHistory.find({ ownerId: dealerId }).fetch(),
        ownerId: dealerId
    };
}, TestWidgetPageDumb);

export default TestWidgetPage


class TreeNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        visible: true,
    };
    this.toggle = this.toggle.bind(this);
  }
  
  toggle() {
    this.setState({visible: !this.state.visible});
  }
  
  render() {
    var childNodes;
    var classObj;

    if (this.props.node.childNodes != null) {
      childNodes = this.props.node.childNodes.map(function(node, index) {
        return <li key={index}><TreeNode node={node} /></li>
      });

      classObj = {
        togglable: true,
        "togglable-down": this.state.visible,
        "togglable-up": !this.state.visible
      };
    }

    var style;
    if (!this.state.visible) {
      style = {display: "none"};
    }

    return (
      <div>
        <h5 onClick={this.toggle} className={classNames(classObj)}>
          {this.props.node.title}
        </h5>
        <ul style={style}>
          {childNodes}
        </ul>
      </div>
    );
  }
}
// http://jsfiddle.net/ssorallen/xx8mw/
