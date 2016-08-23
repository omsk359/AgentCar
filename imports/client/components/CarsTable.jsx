import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Car from './Car';
import Cars from '/imports/common/collections/cars';

export class CarsTableDumb extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    onAddNew(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const mark = target.mark.value;
        const model = target.model.value;
        const equipment = target.equipment.value;
        const year = target.year.value;
        const engine = target.engine.value;
        const color = target.color.value;
        const price = target.price.value;
        const photo = target.photo.value;

    	  // Insert a task into the collection
        Meteor.call('cars.insert', mark, model, equipment, year, engine, color, price, photo);

        // Clear form
        target.mark.value = '';
        target.model.value = '';
        target.equipment.value = '';
        target.year.value = '';
        target.engine.value = '';
        target.color.value = '';
        target.price.value = '';
        target.photo.value = '';
    }
    render() {
        const cars = this.props.cars.map(car => <Car {...car} />);
        return (
          <div>
              <div style="width: 570px; margin: 10px auto;">
              		<strong>Машины:</strong>
              		<form class="new-car">
                			<input type="text" name="mark" placeholder="Марка" />
                			<input type="text" name="model" placeholder="Модель" />
                			<input type="text" name="equipment" placeholder="Комплектация" /><br/>
                			<input type="text" name="year" placeholder="Год" />
                			<input type="text" name="engine" placeholder="Двигатель" />
                			<input type="text" name="color" placeholder="Цвет" /><br/>
                			<input type="text" name="price" placeholder="Цена" />
                			<input type="text" name="photo" placeholder="URL картинки" />
                			<input type="submit" value="Добавить" onClick={this.onAddNew.bind(this)} />
              		</form>
            	</div>
            	<div class="" style="margin-top: 20px; border-top: solid 1px #eee;">
            	    <ul>
                      { cars }
            	    </ul>
            	</div>
          </div>
        )
    }
}
CarsTableDumb.propTypes = {
    cars: React.PropTypes.array
};
CarsTableDumb.defaultProps = {
    cars: []
};


const CarsTable = createContainer(props => {
    const carsHandle = Meteor.subscribe('cars');
    const loading = !carsHandle.ready();

    return {
        loading,
        cars: Cars.find({},
    	     { sort: { mark: 1, model: 1, equipment: 1 },
    		})
    };
}, CarsTableDumb);
