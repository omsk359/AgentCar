import DealerSettings from '/imports/common/collections/DealerSettings';

Meteor.publish('DealerSettings', function(ownerId) {
    return DealerSettings.find({ ownerId });
});
