import { Mongo } from 'meteor/mongo';
 
export const Cars = new Mongo.Collection('cars');

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
 