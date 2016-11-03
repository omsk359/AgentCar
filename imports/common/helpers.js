import moment from 'moment';

export function toMoskowTime(date) {
	return moment(date).utcOffset('+03:00');
}
