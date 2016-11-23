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
	let stats = getCurrentStatsCursor(ownerId).fetch();
	return stats.length ? stats[0] : null;
}

export function initStatsAll(force) {
	let allDealers = DealerSettings.distinct('ownerId');
	allDealers.forEach(ownerId => initStats(ownerId, force));
}

export function initStats(ownerId, force) {
	let stats = getCurrentStats(ownerId);
	console.log(`initStats[${ownerId}]: `, stats);
	if (stats && !stats.date && Statistics.find({ ownerId }).count() == 1) { // old version of the Statistics 
		Statistics.remove({ ownerId });
		updateStats(ownerId, stats);
		return;
	}
	console.log('init stats: ', stats, !stats);
	if (force || !stats)
		updateStats(ownerId, { 
			widgetOpen: 0, widgetLoaded: 0, resultLocks: 0, 
			queries: 0, reserve: 0, needDetails: 0, subscribe: 0 
		});
}

export function updateStats(ownerId, stats) {
	Statistics.insert({ ..._.omit(stats, ['_id']), date: new Date(), ownerId });
}

export function incStatsField(ownerId, field) {
	let stats = getCurrentStats(ownerId);
	stats[field]++;
	console.log('stats: ', stats);
	updateStats(ownerId, stats);
}
