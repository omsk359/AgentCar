import QueriesHistory from '/imports/common/collections/QueriesHistory';

Meteor.publish('QueriesHistory', function(ownerId) {
    return QueriesHistory.find({ ownerId });
});
