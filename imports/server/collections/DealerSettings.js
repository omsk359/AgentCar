import DealerSettings from '/imports/common/collections/DealerSettings';
import _ from 'lodash';

Meteor.publish('DealerSettings', function(ownerId) {
    return DealerSettings.find({ ownerId });
});

DealerSettings.before.insert(function(userId, doc) {
    _.defaults(doc, {
        name: 'No Name',
        mark: false,
        position: 'left',
        color: 'red',
        opacity: 0,
        animate: false,
        customCSS: '',
        placementType: 'dealer' // one of ['dealer', 'partner']
     });
});
