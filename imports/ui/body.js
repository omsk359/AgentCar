import { Template } from 'meteor/templating';
 
import { Cars } from '../api/cars.js';
 
import './body.html';
 
Template.body.helpers({
  cars() {
    return Cars.find({}, { sort: { price: -1 } });
  },
});

Template.body.events({
  'submit .new-car'(event) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get value from form element
    const target = event.target;
    const mark = target.mark.value;
    const model = target.model.value;
    const equipment = target.equipment.value;
    const year = target.year.value;
    const engine = target.engine.value;
    const color = target.color.value;
    const price = target.price.value;
 
    // Insert a task into the collection
    Cars.insert({
		mark,
		model,
		equipment,
		year,
		engine,
		color,
		price,
    });
 
    // Clear form
    target.mark.value = '';
    target.model.value = '';
    target.equipment.value = '';
    target.year.value = '';
    target.engine.value = '';
    target.color.value = '';
    target.price.value = '';
  },
});