import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import Cars from '/imports/common/collections/cars';
// import Statistics from '/imports/common/collections/Statistics';
import QueriesHistory from '/imports/common/collections/QueriesHistory';
import ReserveCars from '/imports/common/collections/ReserveCars';
import DealerSettings from '/imports/common/collections/DealerSettings';
import NegativeSubscribe from '/imports/common/collections/NegativeSubscribe';
import _ from 'lodash';
import nodemailer from 'nodemailer';
import moment from 'moment';
import { toMoskowTime, incStatsField } from '/imports/common/helpers';
// import mg from 'nodemailer-mailgun-transport';
import mg from './nodemailer-mailgun-transport';

import GameSubscribers from '/imports/common/collections/GameSubscribers';

const delta = 70000;


// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
const MAILGUN_AUTH = {
    auth: {
        api_key: 'key-a55c1f851d6bb68169862a6b0274bff0',
        // domain: 'one of your domain names listed at your https://mailgun.com/app/domains'
        domain: 'debian359.tk'
    }
};

const nodemailerMailgun = nodemailer.createTransport(mg(MAILGUN_AUTH));

const EMAIL_TEMPLATE = Assets.getText('email/index2_css_inline.html');


function sendMail(ownerId, car, contactInfo, needDetails) {
	let settings = DealerSettings.findOne({ ownerId });
	if (!settings || !settings.emails)
		return;
	let { name, email, phone } = contactInfo;


	let data = `
		Имя - ${name}<br>
		${ phone ? `Телефон - ${phone}<br />` : ''}
		${ email ? `E-mail - ${email}<br />` : ''}
		Автомобиль: <b>${car.mark} - ${car.model}</b>, цена: <b>${car.price}</b><br>
	`;

	let html = EMAIL_TEMPLATE.replace('REPLACE_DATA', data);

	let subject;
	if (needDetails)
		subject = 'Agent CAR - узнать подробнее';
	else
		subject = 'Agent CAR - бронирование машины';
	
	let sendTo = car.mileage ? settings.emails_secondHand : settings.emails;

	nodemailerMailgun.sendMail({
		// from: 'tmpmail@protonmail.com',
		from: 'test@debian359.tk',
        to: sendTo, // An array if you have multiple recipients.
        // cc:'second@domain.com',
        // bcc:'secretagent@company.gov',
        subject, html
    }, function (err, info) {
        if (err) {
            console.log('Mailgun Error: ', err);
        }
        else {
            console.log('Mailgun Response: ', info);
        }
    });
}

function sendMailSubscribe(ownerId, contactInfo, searchParams) {
	let settings = DealerSettings.findOne({ ownerId });
	if (!settings || !settings.emails)
		return;
	let { mark, model, ac_form_i_have, ac_form_credit_pay, ac_form_secondhand, ac_form_credit_time, ac_form_car_cost } = searchParams;
	let { name, email, phone } = contactInfo;

	let credit = ac_form_credit_pay ? `- я собираюсь брать кредит: с  ежемесячным платежом ${ac_form_credit_pay}, сроком на ${ac_form_credit_time}<br />` : '';
	let tradeIn = ac_form_car_cost ? `- хочу trade - in: моя машина стоит - ${ac_form_car_cost} рублей<br />` : '';
	let data = `
		Имя - ${name}<br />
		${ phone ? `Телефон - ${phone}<br />` : ''}
		${ email ? `E-mail - ${email}<br />` : ''}
		Предпочтения по модели автомобиля: ${mark} ${model} ${ac_form_secondhand ? ' (готов рассмотреть б/у)' : ''}<br />
		Дополнительно:<br />
				- у меня есть ${ac_form_i_have} рублей<br />
				${credit}
				${tradeIn}
	`;

	let subject = 'Agent CAR - подписка на поиск машины';

	let html = EMAIL_TEMPLATE.replace('REPLACE_DATA', data);

	let sendTo = car.mileage ? settings.emails_secondHand: settings.emails;

	nodemailerMailgun.sendMail({
		from: 'test@debian359.tk',
		to: sendTo, // An array if you have multiple recipients.
		// cc:'second@domain.com',
		// bcc:'secretagent@company.gov',
		subject, html
	}, function (err, info) {
		if (err) {
			console.log('Mailgun Error: ', err);
		}
		else {
			console.log('Mailgun Response: ', info);
		}
	});
}

Meteor.methods({
	'cars.insert'(ownerId, { mark, model, equipment, carcase, kpp, year, engineType, engineCapacity, enginePower, color, price, priceold, mileage, availability, photo }) {
		console.log('cars.insert Params: ', arguments);
		check(ownerId, String);
		check(mark, String);
		check(model, String);
		check(equipment, String);
		check(carcase, String);
		check(kpp, String);
		check(year, String);
		check(engineType, String);
		check(engineCapacity, String);
		check(enginePower, String);
		check(color, String);
		check(price, String);
		check(priceold, String);
		check(mileage, String);
		check(availability, String);
		check(photo, String);

		// Make sure the user is logged in before inserting a task
		// if (! this.userId) {
		// 	throw new Meteor.Error('not-authorized');
		// }

		let id = Cars.insert({
			mark,
			model,
			equipment,
			carcase,
			kpp,
			year: +year,
			engine: { type: engineType, capacity: engineCapacity, power: enginePower },
			color,
			price: +price, priceold: +priceold,
			photo,
			mileage: +mileage,
			availability,
	        createdAt: new Date(),
			ownerId,//: this.userId,
			checked: true//,
			/*username: _.get(Meteor.users.findOne(this.userId), 'username') || '',*/
		});
		console.log('id: ', id);
		return id;
	},
	'cars.remove'(carId) {
		check(carId, String);

		Cars.remove(carId);
	},
	'cars.setChecked'(carId, setChecked) {
		check(carId, String);
		check(setChecked, Boolean);

		Cars.update(carId, { $set: { checked: setChecked } });
	},

	availableMarkNames(ownerId) {
		check(ownerId, String);

		Meteor.call('onWidgetLoaded', ownerId);

		return Cars.distinct('mark', { ownerId, checked: true });
	},
	availableMarksModels(ownerId) {
		check(ownerId, String);

		let marksModels = Cars.find({ ownerId, checked: true }, { fields: { mark: 1, model: 1, _id: 0 } }).fetch();
		marksModels = _.uniqWith(marksModels, _.isEqual);

		return marksModels;
	},
	allDealersInfo() {
		// return DealerSettings.allNames().fetch();
		return DealerSettings.find({ placementType: 'dealer' }, { fields: { name: 1, ownerId: 1, _id: 0 } }).fetch();
	},
	getInitWidgetData(ownerId) {
		check(ownerId, String);

		console.time('TODO');

		Meteor.call('onWidgetLoaded', ownerId);

		let marksModels = Meteor.call('availableMarksModels', ownerId);
		let settings = DealerSettings.findOne({ ownerId });
		let dealersInfo = Meteor.call('allDealersInfo');

		console.timeEnd('TODO');

		return { marksModels, settings, dealersInfo };
	},

	onWidgetOpen(ownerId) {
		check(ownerId, String);

		// Statistics.update({ ownerId }, { $inc: { widgetOpen: 1 } }, { upsert: true }, err => {
		// 	// async this, don't wait for response
		// 	if (err)
		// 		console.error('Statistics.update widgetOpen err: ', err);
		// });
		incStatsField(ownerId, 'widgetOpen');
	},
	onWidgetLoaded(ownerId) {
		check(ownerId, String);

		// Statistics.update({ ownerId }, { $inc: { widgetLoaded: 1 } }, { upsert: true }, err => {
		// 	// async this, don't wait for response
		// 	if (err)
		// 		console.error('Statistics.update widgetLoaded err: ', err);
		// });
		incStatsField(ownerId, 'widgetLoaded');
	},

	carsByParams({ ownerId, mark, model, ac_form_i_have, ac_form_credit_pay = 0, ac_form_secondhand = false,
						  				 ac_form_credit_time = 0, ac_form_car_cost = 0 }) {
		console.log('Params: ', arguments);
		check(ownerId, String);
		check(mark, String);
		check(model, String);
		check(ac_form_i_have, Number);
		check(ac_form_credit_pay, Number);
		check(ac_form_credit_time, Number);
		check(ac_form_car_cost, Number);
		check(ac_form_secondhand, Boolean);

		var settings = DealerSettings.findOne({ ownerId });
		if (!settings) throw new Meteor.Error('settings', 'Wrong dealer ID');

		var ac_form_cash = ac_form_i_have + ac_form_credit_pay * ac_form_credit_time + ac_form_car_cost;
		// var ac_gte_cash = ac_form_cash - delta;
		var ac_lte_cash = ac_form_cash + delta;

		var params = {
			checked: true,
            price: { $gte: 0, $lte: ac_lte_cash }
            // price: { $gte: ac_gte_cash, $lte: ac_lte_cash }
		};
		if (settings.placementType == 'dealer')
			_.assign(params, { ownerId, mark });

		if (model)
			params.model = model;
		if (!ac_form_secondhand)
			params.mileage = 0;
		console.log('Params2: ', params);

		// const MAX_RESULT = 5;
		var foundCars = Cars.find(params, { sort: { price: -1 }/*, limit: MAX_RESULT*/ }).fetch();
		if (ac_form_secondhand/* && foundCars.length < MAX_RESULT*/) {
			// Правильно, он может ввести либо любую, либо модель, скажем, тигуан.
			// Если он ставит галку "с пробегом"  - то подтягиваются все (вне зависимости от марки и модели)
			// подержанные машины, которые по цене подходят и все новые тигуаны.

			params.mileage = { $gte: 0 };
			delete params.mark;
			delete params.model;
			let oldCars = Cars.find(params, {sort: { price: -1 }/*, limit: MAX_RESULT - foundCars.length*/}).fetch();
			foundCars = [...foundCars, ...oldCars].sort((car1, car2) => car2.price < car1.price);
		}
		console.log('Found cars: ', foundCars);

		let searchQueryId = QueriesHistory.insert({ ownerId,
			query: {
				mark, model, ac_form_i_have, ac_form_credit_pay, ac_form_credit_time, ac_form_car_cost, ac_form_secondhand
			}, createdAt: new Date(),
			result: foundCars //_.map(foundCars, '_id')
		}/*, err => {
			// async this, don't wait for response
			if (err)
				console.error('QueriesHistory.insert err: ', err);
		}*/);

		// Statistics.update({ ownerId }, { $inc: { queries: 1 } }, { upsert: true }, err => {
		// 	// async this, don't wait for response
		// 	if (err)
		// 		console.error('Statistics.update err: ', err);
		// });
		incStatsField(ownerId, 'queries');

		// return foundCars;
		return { foundCars, searchQueryId };
	},

	reserveCar(ownerId, carId, contactInfo, needDetails = false) {
		console.log('reserveCar params: ', arguments);
		check(ownerId, String);
		check(carId, String);
		check(contactInfo, {
			name: String,
			phone: String,
			email: Match.Maybe(String)
		});
		check(needDetails, Boolean);

		var car = Cars.findOne({ _id: carId });
		console.log('Found car: ', car);
		if (!car)
			throw new Error('Wrong carId');

		sendMail(ownerId, car, contactInfo, needDetails);

		// let incObj = needDetails ? { needDetails: 1 } : { reserve: 1 };
		// Statistics.update({ ownerId }, { $inc: incObj }, { upsert: true }, err => {
		// 	// async this, don't wait for response
		// 	if (err)
		// 		console.error('Stat update err: ', err);
		// });
		incStatsField(ownerId, needDetails ? 'needDetails' : 'reserve');

		return ReserveCars.insert({ ownerId, car, contactInfo, needDetails });
	},

	negativeSubscribe({ ownerId, contactInfo, searchParams }) {
		console.log('negativeSubscribe params: ', arguments);
		check(ownerId, String);
		check(contactInfo, {
			name: String,
			email: String,
			phone: Match.Maybe(String)
		});
		check(searchParams, {
			mark: String,
			model: String,
			ac_form_i_have: Number,
			ac_form_credit_pay: Number,
			ac_form_secondhand: Boolean,
			ac_form_credit_time: Number,
			ac_form_car_cost: Number
		});

		sendMailSubscribe(ownerId, contactInfo, searchParams);

		// Statistics.update({ ownerId }, { $inc: { subscribe: 1 } }, { upsert: true }, err => {
		// 	// async this, don't wait for response
		// 	if (err)
		// 		console.error('Stat update err: ', err);
		// });
		incStatsField(ownerId, 'subscribe');

		return NegativeSubscribe.insert({ ownerId, contactInfo, searchParams });
	},

	saveSettings(ownerId, settings) {
		console.log('saveSettings params: ', arguments);
		check(ownerId, String);
		check(settings, {
			customCSS: String,
			underElements: String,
			overElements: String,
		});

		var settingsDB = DealerSettings.findOne({ ownerId });
		console.log('Found settingsDB: ', settingsDB);
		if (!settingsDB)
			throw new Error('Wrong ownerId');

		_.assign(settingsDB, settings);
		return DealerSettings.update({ ownerId }, settingsDB);
	},

	onCarView(carId) {
		check(carId, String);

		let car = Cars.findOne({ _id: carId });
		if (!car) throw new Meteor.Error('car', 'Wrong car ID');

		// let toMoskowTime = date => moment(date).utcOffset('+03:00');

		if (toMoskowTime().date() != toMoskowTime(car.viewLastDate).date()) // new day
			var viewCnt = _.random(3, 15);
		else
			viewCnt = car.viewCnt + 1;

		Cars.update({ _id: carId }, { $set: { viewCnt }, $currentDate: { viewLastDate: true } }, { upsert: true });
	},

	onResultLock(ownerId, searchQueryId, contactInfo) {
		console.log('onResultLock params: ', arguments);
		check(searchQueryId, String);
		check(contactInfo, {
			phone: String,
			name: String
		});

		QueriesHistory.upsert({ _id: searchQueryId }, { $set: { contactInfo }, $currentDate: { contactInfoDate: true } }, err => {
		// console.log('QueriesHistory.upsert params: ', arr);
			// async this, don't wait for response
			if (err)
				console.error('QueriesHistory.update err: ', err);
		});
		// Statistics.update({ ownerId }, { $inc: { resultLocks: 1 } }, { upsert: true }, err => {
		// 	// async this, don't wait for response
		// 	if (err)
		// 		console.error('Statistics.update err: ', err);
		// });
		incStatsField(ownerId, 'resultLocks');
	},


	gameSubscribe(ownerId, resultType, contactInfo) {
		console.log('gameSubscribe params: ', arguments);
		check(ownerId, String);
		check(resultType, Number);
		check(contactInfo, {
			name: String,
			email: String,
			phone: String
		});

		return GameSubscribers.insert({ ownerId, contactInfo, resultType });
	}
});
