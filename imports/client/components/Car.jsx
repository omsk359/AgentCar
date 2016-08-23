import React from 'react';

export default class Car extends React.Component {
    constructor(props) {
        super(props);
    }
    isOwner() {
        return this.props.owner === Meteor.userId();
    }
    onChecked(e) {
        Meteor.call('cars.setChecked', this._id, !this.checked);
    }
    onDelete() {
        Meteor.call('cars.remove', this._id);
    }
    render() {
        const { checked, mark, model, equipment,
                year, engine, color, price } = this.props;
        return (
            <li class={checked ? 'checked' : ''}>
          	    <button class="delete">&times;</button>
          	    <input type="checkbox" checked={checked} class="toggle-checked"
                       onClick={this.onChecked.bind(this)} />
          		  <span class="text">{mark} {model} {equipment} {year} / {engine} / {color} - {price} р.</span>
          	</li>
        )
    }
}
Car.propTypes = {
    checked: React.PropTypes.bool,
    mark : React.PropTypes.string,
    model : React.PropTypes.string,
    equipment : React.PropTypes.string,
    year : React.PropTypes.string,
    engine : React.PropTypes.string,
    color : React.PropTypes.string,
    price : React.PropTypes.string,
    owner: React.PropTypes.string,
    _id: React.PropTypes.string
};
