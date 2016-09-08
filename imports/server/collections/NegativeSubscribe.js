import NegativeSubscribe from '/imports/common/collections/NegativeSubscribe';

Meteor.publish('NegativeSubscribe', function(ownerId) {
    return NegativeSubscribe.find({ ownerId });
});
