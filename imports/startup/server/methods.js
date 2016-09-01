import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import Cars from '/imports/common/collections/cars';
import Statistics from '/imports/common/collections/Statistics';
import QueriesHistory from '/imports/common/collections/QueriesHistory';
import ReserveCars from '/imports/common/collections/ReserveCars';
import _ from 'lodash';

const delta = 70000;

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

		Meteor.call('onWidgetLoaded', ownerId);

		return Cars.find({ ownerId, checked: true }, { fields: { mark: 1, model: 1 } }).fetch();
	},

	onWidgetOpen(ownerId) {
		check(ownerId, String);

		Statistics.update({ ownerId }, { $inc: { widgetOpen: 1 } }, { upsert: true });
	},
	onWidgetLoaded(ownerId) {
		check(ownerId, String);

		Statistics.update({ ownerId }, { $inc: { widgetLoaded: 1 } }, { upsert: true });
	},

	carsByParams({ ownerId, mark, model, ac_form_i_have, ac_form_credit_pay = 0,
						  				 ac_form_credit_time = 0, ac_form_car_cost = 0 }) {
		console.log('Params: ', arguments);
		check(ownerId, String);
		check(mark, String);
		check(model, String);
		check(ac_form_i_have, Number);
		check(ac_form_credit_pay, Number);
		check(ac_form_credit_time, Number);
		check(ac_form_car_cost, Number);

		var ac_form_cash = ac_form_i_have + ac_form_credit_pay * ac_form_credit_time + ac_form_car_cost;
		var ac_gte_cash = ac_form_cash - delta;
		var ac_lte_cash = ac_form_cash + delta;
		// console.log(`gte: ${ac_gte_cash}; lte: ${ac_lte_cash}`);
		// console.log(`Cars: ${Cars.find({ mark, price: { $gte: ac_gte_cash, $lte: ac_lte_cash } }).count()}`);

		var params = {
			ownerId, mark, model, checked: true,
            price: { $gte: 0, $lte: ac_lte_cash }
            // price: { $gte: ac_gte_cash, $lte: ac_lte_cash }
		};
		console.log('Params2: ', params);
		if (!model)
			delete params.model;

		var foundCars = Cars.find(params, { sort: { price: -1 } }).fetch();
		console.log('Found cars: ', foundCars);

		QueriesHistory.insert({ ownerId,
			query: {
				mark, model, ac_form_i_have, ac_form_credit_pay, ac_form_credit_time, ac_form_car_cost
			},
			result: foundCars //_.map(foundCars, '_id')
		});
		Statistics.update({ ownerId }, { $inc: { queries: 1 } }, { upsert: true });

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

		return ReserveCars.insert({ ownerId, car, contactInfo });
	}
});
