import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
 
export const Cars = new Mongo.Collection('cars');

if (Meteor.isServer) {
	// This code only runs on the server
	Meteor.publish('cars', function carsPublication() {
		return Cars.find({ owner: this.userId });
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
			owner: this.userId,
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
	'cars.find'(token) {
		Meteor.publish('carz', function () {
			return Cars.find({ owner: token });
		});		
	},
});

// if (Meteor.isServer) {
//   // This code only runs on the server
//   Meteor.publish('cars', function carsPublication() {
//     return Cars.find();
//   });
//