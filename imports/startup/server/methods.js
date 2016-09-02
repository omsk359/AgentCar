import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import Cars from '/imports/common/collections/cars';
import Statistics from '/imports/common/collections/Statistics';
import QueriesHistory from '/imports/common/collections/QueriesHistory';
import ReserveCars from '/imports/common/collections/ReserveCars';
import DealerSettings from '/imports/common/collections/DealerSettings';
import _ from 'lodash';
import nodemailer from 'nodemailer';
// import mg from 'nodemailer-mailgun-transport';
import mg from './nodemailer-mailgun-transport';

const delta = 70000;


// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
const auth = {
    auth: {
        api_key: 'key-a55c1f851d6bb68169862a6b0274bff0',
        // domain: 'one of your domain names listed at your https://mailgun.com/app/domains'
        domain: 'debian359.tk'
    }
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

function sendMail(ownerId, car, contactInfo) {
	let settings = DealerSettings.findOne({ ownerId });
	if (!settings || !settings.emails)
		return;
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
    let emailStr = contactInfo.email ? `E-mail - <b>${contactInfo.email}</b><br>` : '';
    nodemailerMailgun.sendMail({
		// from: 'tmpmail@protonmail.com',
		from: 'test@debian359.tk',
        to: settings.emails, // An array if you have multiple recipients.
        // cc:'second@domain.com',
        // bcc:'secretagent@company.gov',
        subject: `Бронирование машины`,
        // 'h:Reply-To': 'reply2this@company.com',
        //You can use "html:" to send HTML email content. It's magic!
		html:
`Друзья, сообщаем, что у Вас появился новый  клиент на покупку автомобиля.<br>
Его контактные данные:<br>
Имя - <b>${contactInfo.name}</b><br>
Телефон - <b>${contactInfo.phone}</b><br>
${emailStr}
Автомобиль: <b>${car.mark} - ${car.model}</b>, цена: <b>${car.price}</b><br>
Удачных продаж)<br>
<i>Ваш <br>
AgentCar.</i>`
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
	'cars.insert'(mark, model, equipment, year, engine, color, price, photo) {
		check(mark, String);
		check(model, String);
		check(equipment, String);
		check(year, String);
		check(engine, String);
		check(color, String);
		check(price, String);
		check(photo, String);

		// Make sure the user is logged in before inserting a task
		if (! this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		Cars.insert({
			mark,
			model,
			equipment,
			year,
			engine,
			color,
			price,
			photo,
			//      createdAt: new Date(),
			ownerId: this.userId,
			username: Meteor.users.findOne(this.userId).username,
		});
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
	getInitWidgetData(ownerId) {
		check(ownerId, String);

		Meteor.call('onWidgetLoaded', ownerId);

		let marksModels = Meteor.call('availableMarksModels', ownerId);
		let settings = DealerSettings.findOne({ ownerId });

		return { marksModels, settings };
	},

	onWidgetOpen(ownerId) {
		check(ownerId, String);

		Statistics.update({ ownerId }, { $inc: { widgetOpen: 1 } }, { upsert: true }, (err) => {
			// async this, don't wait for response
			if (err)
				console.error('Statistics.update widgetOpen err: ', err);
		});
	},
	onWidgetLoaded(ownerId) {
		check(ownerId, String);

		Statistics.update({ ownerId }, { $inc: { widgetLoaded: 1 } }, { upsert: true }, (err) => {
			// async this, don't wait for response
			if (err)
				console.error('Statistics.update widgetLoaded err: ', err);
		});
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

		var ac_form_cash = ac_form_i_have + ac_form_credit_pay * ac_form_credit_time + ac_form_car_cost;
		var ac_gte_cash = ac_form_cash - delta;
		var ac_lte_cash = ac_form_cash + delta;
		// console.log(`gte: ${ac_gte_cash}; lte: ${ac_lte_cash}`);
		// console.log(`Cars: ${Cars.find({ mark, price: { $gte: ac_gte_cash, $lte: ac_lte_cash } }).count()}`);

		var params = {
			ownerId, mark, checked: true,
            price: { $gte: 0, $lte: ac_lte_cash }
            // price: { $gte: ac_gte_cash, $lte: ac_lte_cash }
		};
		console.log('Params2: ', params);
		if (model)
			params.model = model;
		if (!ac_form_secondhand)
			params.mileage = 0;

		var foundCars = Cars.find(params, { sort: { price: -1 }, limit: 5 }).fetch();
		console.log('Found cars: ', foundCars);

		QueriesHistory.insert({ ownerId,
			query: {
				mark, model, ac_form_i_have, ac_form_credit_pay, ac_form_credit_time, ac_form_car_cost, ac_form_secondhand
			},
			result: foundCars //_.map(foundCars, '_id')
		}, (err) => {
			// async this, don't wait for response
			if (err)
				console.error('QueriesHistory.insert err: ', err);
		});
		Statistics.update({ ownerId }, { $inc: { queries: 1 } }, { upsert: true }, (err) => {
			// async this, don't wait for response
			if (err)
				console.error('Statistics.update err: ', err);
		});

		return foundCars;
	},

	reserveCar(ownerId, carId, contactInfo) {
		console.log('reserveCar params: ', arguments);
		check(ownerId, String);
		check(carId, String);
		check(contactInfo, {
			name: String,
			phone: String,
			email: Match.Maybe(String)
		});

		var car = Cars.findOne({ _id: carId });
		console.log('Found car: ', car);
		if (!car)
			throw new Error('Wrong carId');

        sendMail(ownerId, car, contactInfo);

		Statistics.update({ ownerId }, { $inc: { reserve: 1 } }, { upsert: true }, (err) => {
			// async this, don't wait for response
			if (err)
				console.error('Stat update err: ', err);
		});

		return ReserveCars.insert({ ownerId, car, contactInfo });
	}
});
