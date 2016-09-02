import ReserveCars from '/imports/common/collections/ReserveCars';

Meteor.publish('ReserveCars', function(ownerId) {
    // TODO: only auth users
    return ReserveCars.find({ ownerId });
});
