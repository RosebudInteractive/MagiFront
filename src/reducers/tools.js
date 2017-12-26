export const moveObjectUp = (array, objectId) => {
    let _array = [];
    let _modified = false;

    let _index = array.findIndex((item) => {return item.id == objectId});
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

    let _selected =
        (_index > -1)
            ?
            (_index < _array.length)
                ?
                _array[_index].id
                :
                _array[_array.length - 1].id
            :
            null;

    if (_modified) {
        setObjectsRank(_array);
    }

    return {modified : _modified, resultArray : _array, selected : _selected};
};

export const setObjectsRank = (array) => {
    array.forEach((item, index) => {
        item.Number = index +1
    })
};

export const deleteObject = (array, objectId) => {
    let _array = [];
    let _deleted = -1;

    array.forEach((item, index) => {
        if (item.id !== parseInt(objectId)) {
            _array.push({...item});
        } else {
            _deleted = index;
        }
    });

    let _selected =
        (_deleted > -1)
            ?
            (_deleted < _array.length)
                ?
                _array[_deleted].id
                :
                _array[_array.length - 1].id
            :
            null;

    return {resultArray : _array, selected : _selected}
};