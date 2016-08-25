import Statistics from '/imports/common/collections/Statistics';
// import Cars from '/imports/common/collections/cars';

Meteor.publish('statistics', function(ownerId) {
    return Statistics.find({ ownerId });
});
// Meteor.publish('statistics', function() {
//     return Statistics.find({  });
// });
