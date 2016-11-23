import Cars from '/imports/common/collections/cars';
import moment from "moment";
import _ from 'lodash';

Meteor.publish('cars', function carsPublication() {
    return Cars.find({ ownerId: this.userId });
});

Cars.before.insert(function(userId, car) {
    car.viewLastDate = moment().subtract(1, 'day').toDate();
    car.createdAt = new Date();
    car.viewCnt = _.random(3, 15);
});
