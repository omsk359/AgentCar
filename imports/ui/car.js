import { Template } from 'meteor/templating';
 
import { Cars } from '../api/cars.js';
 
import './car.html';
 
Template.car.events({
  'click .toggle-checked'() {
    // Set the checked property to the opposite of its current value
    Cars.update(this._id, {
      $set: { checked: ! this.checked },
    });
  },
  'click .delete'() {
    Cars.remove(this._id);
  },
});