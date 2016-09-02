import './methods';
import '/imports/server/collections/cars';
import '/imports/server/collections/Statistics';
import '/imports/server/collections/ReserveCars';
import '/imports/server/collections/DealerSettings';
import _ from 'lodash';


// for testing

import Cars from '/imports/common/collections/cars';


// import { getCars } from './cars_xls';

// getCars().then(CarsObjects => {
//     console.log('CarsObjects: ', CarsObjects);
//     console.log('CarsObjects prices: ', _.map(CarsObjects, 'price'));
//     console.log('CarsObjects prices: ', _.map(CarsObjects, 'photo'));
//     Cars.remove({});
//     CarsObjects.forEach(obj => Cars.insert(obj));
// });

import CarsObjects from './cars_xls';

console.log('CarsObjects: ', CarsObjects);
console.log('CarsObjects prices: ', _.map(CarsObjects, 'price'));
console.log('CarsObjects prices: ', _.map(CarsObjects, 'photo'));
Cars.remove({});
CarsObjects.forEach(obj => Cars.insert(obj));

import DealerSettings from '/imports/common/collections/DealerSettings';

DealerSettings.remove({});
DealerSettings.insert({ ownerId: 'kZD2WwvnheG9RCwwD', mark: 'LADA', customCSS: '', emails: ['omsk359@protonmail.com', 'victory.ch123@yandex.ru', 'buzillo@ya.ru', 'petemic@yandex.ru'] });
// sparz2
DealerSettings.insert({ ownerId: 'kZD2WwvnheG9RCkeK', mark: 'LADA', customCSS: '', emails: ['omsk359@protonmail.com', 'victory.ch123@yandex.ru', 'buzillo@ya.ru', 'petemic@yandex.ru'] });
DealerSettings.insert({ ownerId: 'kZD2WwvnheGtest1', mark: 'LADA', customCSS: '.agent_car_logo { right: 45px !important; }', emails: false });
DealerSettings.insert({ ownerId: 'kZD2WwvnheGtest2', mark: 'SKODA', customCSS: '.agent_car_widget { right: 55px !important; } .agent_car_logo { left: 100px !important; }', emails: false });

// Cars.insert({ mark: 'KIA', model: 'PICANTO', equipment: 'Classic', k: 'хачбек', color: 'красный',
//     engine: 'вид: бензиновый; объем: 1.0; мощность: 66; кпп: 5МТ; ускорение: 14.6; расход бензина: 4.5',
//     price: 489000,
//     photo: 'http://img1.liveinternet.ru/images/attach/c/4/78/871/78871945_kia_picanto.jpg',
//     ownerId: 'kZD2WwvnheG9RCwwD',
//     checked: true
// });
// Cars.insert({ mark: 'KIA', model: 'RIO', equipment: 'Comfort', k: 'седан', color: 'синий',
//     engine: 'вид: бензиновый; объем: 1.4; мощность: 107; кпп: 5МТ; ускорение: 11.5; расход бензина: 6',
//     price: 601900,
//     photo: 'http://cache.zr.ru/wpfiles/uploads/2012/03/201203301023_rioh_02.jpg',
//     ownerId: 'kZD2WwvnheG9RCwwD',
//     checked: true
// });
// Cars.insert({ mark: 'KIA', model: 'CEED', equipment: 'Classic', k: 'хачбек', color: 'серый',
//     engine: 'вид: бензиновый; объем: 1.4; мощность: 100; кпп: 6МТ; ускорение: 12.7; расход бензина: 6.2',
//     price: 769900,
//     photo: 'http://cozodoy.ru/images/content/0203147.jpg',
//     ownerId: 'kZD2WwvnheG9RCwwD',
//     checked: true
// });


/*
const carObj = {
    mark: 'mark22',
    model: 'model22',
    equipment: 'equipment22',
    year: 2005,
    engine: 'engine22',
    color: 'color22',
    price: 500000,
    photo: 'photo22',
    ownerId: 'kZD2WwvnheG9RCwwD',
    checked: true
};

if (Cars.find({}).count())
    Cars.remove({});

Cars.insert({...carObj, mark: 'mark_1', model: 'model_1', price: 500000});
Cars.insert({...carObj, mark: 'mark_1', model: 'model_2', price: 400000});
Cars.insert({...carObj, mark: 'mark_1', model: 'model_3', price: 450000});
Cars.insert({...carObj, mark: 'mark_1', model: 'model_4', price: 600000});

Cars.insert({...carObj, mark: 'mark_2', model: 'model_21', price: 400000});
Cars.insert({...carObj, mark: 'mark_2', model: 'model_22', price: 450000});

Cars.insert({...carObj, mark: 'mark_3', model: 'model_31', price: 400000});
Cars.insert({...carObj, mark: 'mark_3', model: 'model_32', price: 300000});

Cars.insert({...carObj, mark: 'mark_4', model: 'model_41', price: 380000, ownerId: 'aaaaa'});
Cars.insert({...carObj, mark: 'mark_4', model: 'model_42', price: 320000, ownerId: 'aaaaa'});
*/
