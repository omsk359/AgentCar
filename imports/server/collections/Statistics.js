import Statistics from '/imports/common/collections/Statistics';
import { getCurrentStatsCursor } from '/imports/common/helpers';

Meteor.publish('statistics', function(ownerId) {
	return getCurrentStatsCursor(ownerId);
    // return Statistics.find({ ownerId });
});
Meteor.publish('statisticsHistory', function(ownerId) {
    return Statistics.find({ ownerId });
});

// Meteor.publish('statistics', function() {
//     return Statistics.find({  });
// });
