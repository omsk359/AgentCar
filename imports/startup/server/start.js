import './methods';
import '/imports/server/collections/cars';
import '/imports/server/collections/Statistics';


// for testing

import Cars from '/imports/common/collections/cars';

const carObj = {
    mark: 'mark22',
    model: 'model22',
    equipment: 'equipment22',
    year: 2005,
    engine: 'engine22',
    color: 'color22',
    price: 500000,
    photo: 'photo22',
    ownerId: 'kZD2WwvnheG9RCwwD',
    checked: true
};

if (Cars.find({}).count())
    Cars.remove({});

Cars.insert({...carObj, mark: 'mark_1', model: 'model_1', price: 500000});
Cars.insert({...carObj, mark: 'mark_1', model: 'model_2', price: 400000});
Cars.insert({...carObj, mark: 'mark_1', model: 'model_3', price: 450000});
Cars.insert({...carObj, mark: 'mark_1', model: 'model_4', price: 600000});

Cars.insert({...carObj, mark: 'mark_2', model: 'model_21', price: 400000});
Cars.insert({...carObj, mark: 'mark_2', model: 'model_22', price: 450000});

Cars.insert({...carObj, mark: 'mark_3', model: 'model_31', price: 400000});
Cars.insert({...carObj, mark: 'mark_3', model: 'model_32', price: 300000});

Cars.insert({...carObj, mark: 'mark_4', model: 'model_41', price: 380000, ownerId: 'aaaaa'});
Cars.insert({...carObj, mark: 'mark_4', model: 'model_42', price: 320000, ownerId: 'aaaaa'});
