let resultTypes = ["дополнительное оборудование на выбор", "скидка на КАСКО 15%", "бесплатное ТО3"];

export function getResult(type) {
    if (type >= 0 && type < resultTypes.length)
        return resultTypes[type];
    return '??';
}

export { resultTypes }
