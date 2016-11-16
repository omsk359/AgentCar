import moment from 'moment';
import Statistics from './collections/Statistics';
import DealerSettings from './collections/DealerSettings';

export function toMoskowTime(date) {
	return moment(date).utcOffset('+03:00');
}

export function getCurrentStatsCursor(ownerId) {
	// return Statistics.find({ $query: { ownerId }, $orderby: { date: -1 },  });
	return Statistics.find({ ownerId }, { sort: { date: -1 }, limit: 1 });
}
export function getCurrentStats(ownerId) {
	// return Statistics.findOne({ $query: { ownerId }, $orderby: { date: -1 } });
	// return Statistics.find({ ownerId }, { sort: { date: -1 }, limit: 1 });
	return getCurrentStatsCursor(ownerId);
}

export function initStatsAll(force) {
	let allDealers = DealerSettings.distinct('ownerId');
	allDealers.forEach(ownerId => initStats(ownerId, force));
}

export function initStats(ownerId, force) {
	if (force || !getCurrentStats(ownerId))
		updateStats(ownerId, { 
			widgetOpen: 0, widgetLoaded: 0, resultLocks: 0, 
			queries: 0, reserve: 0, needDetails: 0, subscribe: 0 
		});
}

export function updateStats(ownerId, stats) {
	Statistics.insert({ ...stats, date: new Date() });
}

export function incStatsField(ownerId, field) {
	let stats = getCurrentStats(ownerId);
	stats[field]++;
	updateStats(ownerId, stats);
}
