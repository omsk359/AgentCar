import _ from 'lodash';

const DealerSettings = new Mongo.Collection('DealerSettings');

// DealerSettings.allNames = () => DealerSettings.find({});
// DealerSettings.allNames = (placementType = 'dealer') => DealerSettings.find({ placementType }, { fields: { name: 1, ownerId: 1 } });
        	// DealerSettings.find({ placementType }, { fields: { name: 1, ownerId: 1, ..._.transform(omits, (obj, prop) => obj[prop] = 0) _id: 0 } });

export default DealerSettings
