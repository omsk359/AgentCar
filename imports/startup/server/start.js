import './methods';
import '/imports/server/collections/cars';
import '/imports/server/collections/Statistics';
import '/imports/server/collections/ReserveCars';
import '/imports/server/collections/DealerSettings';
import '/imports/server/collections/NegativeSubscribe';
import _ from 'lodash';
import './http_headers';
import '/imports/server/collections/GameSubscribers';
import '/imports/server/collections/QueriesHistory';


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

import skodaProductionCars_new from './skoda_json';
import skodaProductionCars_bu from './sigma_bu_json';
import skodaProductionCars_bu2 from './sigma_bu2_json';
let skodaProductionCars = [...skodaProductionCars_new, ...skodaProductionCars_bu, ...skodaProductionCars_bu2];
skodaProductionCars = skodaProductionCars.map(car => ({ ...car, availability: 'в наличии' }));
const SkodaTest = skodaProductionCars.map(car => ({ ...car, ownerId: 'kZD2WwvnheGtest3' }));
const SkodaProd = skodaProductionCars.map(car => ({ ...car, ownerId: 'keK2WwvnheGwvnh' }));
[...SkodaTest, ...SkodaProd].forEach(obj => Cars.insert({ ...obj, checked: true }));

import DealerSettings from '/imports/common/collections/DealerSettings';

DealerSettings.remove({});
DealerSettings.insert({ ownerId: 'kZD2WwvnheG9RCwwD', mark: 'LADA', emails: ['omsk359@protonmail.com', 'victory.ch123@yandex.ru', 'buzillo@ya.ru', 'petemic@yandex.ru'] });
// sparz2
DealerSettings.insert({ ownerId: 'kZD2WwvnheG9RCkeK', mark: 'LADA', emails: ['omsk359@protonmail.com', 'victory.ch123@yandex.ru', 'buzillo@ya.ru', 'petemic@yandex.ru'] });
DealerSettings.insert({ ownerId: 'kZD2WwvnheGtest1', mark: 'LADA', emails: false });
DealerSettings.insert({ ownerId: 'kZD2WwvnheGtest2', mark: 'Skoda', position: 'right', color: 'green', opacity: 80, animate: true, emails: false });

DealerSettings.insert({ ownerId: 'kZD2WwvnheGtest3', mark: 'SKODA', position: 'left', color: 'green', opacity: 80, animate: true, emails: ['omsk359@protonmail.com'] });
// DealerSettings.insert({ ownerId: 'kZD2WwvnheGtest3', mark: 'SKODA', position: 'left', color: 'green', opacity: 80, animate: true, emails: ['omsk359@protonmail.com', 'victory.ch123@yandex.ru', 'buzillo@ya.ru', 'petemic@yandex.ru'] });
DealerSettings.insert({
	ownerId: 'kZD2WwvnheGtest4',
	placementType: 'partner', name: 'PartnerTest',
	position: 'left', color: 'green', opacity: 80, animate: true,
	emails: ['omsk359@protonmail.com', 'victory.ch123@yandex.ru', 'buzillo@ya.ru', 'petemic@yandex.ru']
});
DealerSettings.insert({
	ownerId: 'keK2WwvnheGwvnh', name: 'Sigma', mark: 'SKODA',
	position: 'left', color: 'green', opacity: 80, animate: true,
	emails: [
		'omsk359@protonmail.com',
		'victory.ch123@yandex.ru',
		'buzillo@ya.ru',
		'petemic@yandex.ru',
		'skorospehova.alena@sigma.spb.ru',
		'car.sales.skoda@sigma.spb.ru',
		'reception-skoda@sigma.spb.ru'
	],
	emails_secondHand: [
		'Baranov.Nikolay@sigma.spb.ru',
		'Grigorev.Anton@sigma.spb.ru',
		'Rozhkov.Ilya@sigma.spb.ru',
		'Mesnyankin.Artem@sigma.spb.ru',
		'Solovev.Sergey@sigma.spb.ru',

		'omsk359@protonmail.com',
		'victory.ch123@yandex.ru',
		'buzillo@ya.ru',
		'petemic@yandex.ru'
	]
});

/*
var html = Assets.getText('email_template.html');
console.log(html);


import nodemailer from 'nodemailer';
// import mg from 'nodemailer-mailgun-transport';
import mg from './nodemailer-mailgun-transport';


// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
const auth = {
	auth: {
		api_key: 'key-a55c1f851d6bb68169862a6b0274bff0',
		// domain: 'one of your domain names listed at your https://mailgun.com/app/domains'
		domain: 'debian359.tk'
	}
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

function sendMail(ownerId, car, contactInfo, needDetails) {
	// switch (ownerId) {
	// case 'kZD2WwvnheG9RCwwD':
	// 	var emails = ['omsk359@protonmail.com', 'victory.ch123@yandex.ru', 'buzillo@ya.ru', 'petemic@yandex.ru'];
	// 	break;
	// case 'kZD2WwvnheG9RCkeK': // LADA
	// 	emails = ['omsk359@protonmail.com', 'victory.ch123@yandex.ru', 'buzillo@ya.ru', 'petemic@yandex.ru'];
	// 	break;
	//     default:
	//     	emails = settings.email;
	//         throw Error('Wrong dealer ID');
	// }
	var subject = 'Test';

	nodemailerMailgun.sendMail({
		// from: 'tmpmail@protonmail.com',
		from: 'test@debian359.tk',
		to: ['omsk359@protonmail.com', 'victory.ch123@yandex.ru', 'buzillo@ya.ru', 'petemic@yandex.ru'], // An array if you have multiple recipients.
		// cc:'second@domain.com',
		// bcc:'secretagent@company.gov',
		subject,
		html
	}, function (err, info) {
		if (err) {
			console.log('Mailgun Error: ', err);
		}
		else {
			console.log('Mailgun Response: ', info);
		}
	});
}
// sendMail();
*/

// import Statistics from '/imports/common/collections/Statistics';
// Statistics.remove({ ownerId: 'keK2WwvnheGwvnh' });
// import ReserveCars from '/imports/common/collections/ReserveCars';
// ReserveCars.remove({ ownerId: 'keK2WwvnheGwvnh' });
// import NegativeSubscribe from '/imports/common/collections/NegativeSubscribe';
// NegativeSubscribe.remove({ ownerId: 'keK2WwvnheGwvnh' });

// DealerSettings.insert({ ownerId: 'kZD2WwvnheGtest1', mark: 'LADA', position: 'left', customCSS: '.agent_car_logo { right: 45px !important; }', emails: false });
// DealerSettings.insert({ ownerId: 'kZD2WwvnheGtest2', mark: 'SKODA', customCSS: '.agent_car_widget { right: 55px !important; } .agent_car_logo { left: 100px !important; }', emails: false });

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
