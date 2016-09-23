let resultTypes = [ 'Результат 1', 'Результат 2' ];

export function getResult(type) {
    if (type >= 0 && type < resultTypes.length)
        return resultTypes[type];
    return '??';
}

export { resultTypes }
