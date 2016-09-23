import GameSubscribers from '/imports/common/collections/GameSubscribers';

Meteor.publish('GameSubscribers', function(ownerId) {
    return GameSubscribers.find({ ownerId });
});
