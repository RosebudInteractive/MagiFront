export const moveObjectUp = (array, objectId) => {
    let _array = [];
    let _modified = false;

    let _index = array.findIndex((item) => {return item.id === objectId});
    if (_index > 0) {
        let _deleted = array.splice(_index - 1, 1);
        array.splice(_index, 0, _deleted[0]);
        _modified = true;
    }

    if (_modified) {
        setObjectsRank(array);
    }

    _array.push(...array);

    return {modified : _modified, resultArray : _array};
};

export const moveObjectDown = (array, objectId) => {
    let _array = [];
    let _modified = false;

    let _index = array.findIndex((item) => {
        return item.id === objectId
    });
    if (_index < array.length - 1) {
        let _deleted = array.splice(_index, 1);
        array.splice(_index + 1, 0, _deleted[0]);
        _modified = true;
    }

    if (_modified) {
        setObjectsRank(array);
    }

    _array.push(...array);

    return {modified : _modified, resultArray : _array};
};

export const removeObject = (array, objectId) => {
    let _array = [];
    let _modified = false;

    let _index = array.findIndex((item) => {return item.id === objectId});
    if (_index > -1) {
        _modified = true;
        array.splice(_index, 1);
    }

    _array.push(...array);
    if (_modified) {
        setObjectsRank(_array);
    }

    return {modified : _modified, resultArray : _array};
};

export const setObjectsRank = (array) => {
    array.forEach((item, index) => {
        item.Number = index +1
    })
};