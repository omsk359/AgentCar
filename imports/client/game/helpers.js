let resultTypes = ["скидка на дополнительное оборудование 15%", "скидка на КАСКО 15%", "бесплатное ТО"];

export function getResult(type) {
    if (type >= 0 && type < resultTypes.length)
        return resultTypes[type];
    return '??';
}

export { resultTypes }
