import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
 
export const Cars = new Mongo.Collection('cars');

Meteor.methods({
	'cars.insert'(mark, model, equipment, year, engine, color, price) {
		check(mark, String);
		check(model, String);
		check(equipment, String);
		check(year, String);
		check(engine, String);
		check(color, String);
		check(price, String);

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
});

// if (Meteor.isServer) {
//   // This code only runs on the server
//   Meteor.publish('cars', function carsPublication() {
//     return Cars.find();
//   });
//
//   Meteor.publish('recentCars', function() {
//     return Cars.find({
//       sort: {
//         price: 1
//       },
//       limit: 20
//     });
//   });
// }
 