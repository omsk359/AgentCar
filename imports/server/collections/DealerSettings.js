import DealerSettings from '/imports/common/collections/DealerSettings';
import _ from 'lodash';

Meteor.publish('DealerSettings', function(ownerId) {
    return DealerSettings.find({ ownerId });
});

Meteor.publish('DealerSettings_allNames', function(/*placementType = 'dealer'*/) {
    return DealerSettings.find({ placementType: 'dealer' }, { fields: { name: 1, ownerId: 1 } });
    // return DealerSettings.allNames(placementType);//.find({ placementType }, { fields: { name: 1, ownerId: 1, _id: 0 } });
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
