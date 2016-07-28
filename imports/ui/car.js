import { Template } from 'meteor/templating';
 
import { Cars } from '../api/cars.js';
 
import './car.html';
 
Template.car.events({
	'click .toggle-checked'() {
		// Set the checked property to the opposite of its current value
		Meteor.call('cars.setChecked', this._id, !this.checked);
	},
		'click .delete'() {
		Meteor.call('cars.remove', this._id);
	},
});