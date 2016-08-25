import Cars from '/imports/common/collections/cars';

Meteor.publish('cars', function carsPublication() {
    return Cars.find({ ownerId: this.userId });
});
