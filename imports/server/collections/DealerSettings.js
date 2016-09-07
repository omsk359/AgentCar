import DealerSettings from '/imports/common/collections/DealerSettings';
import _ from 'lodash';

Meteor.publish('DealerSettings', function(ownerId) {
    return DealerSettings.find({ ownerId });
});

DealerSettings.before.insert(function(userId, doc) {
    _.defaults(doc, {
        position: 'left',
        color: 'red',
        opacity: 0,
        animate: false,
        customCSS: ''
     });
});
