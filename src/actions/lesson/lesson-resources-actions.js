import {
    SELECT_RESOURCE,
    INSERT_RESOURCE,
    UPDATE_RESOURCE,
    REMOVE_RESOURCE,
    MOVE_RESOURCE_UP,
    MOVE_RESOURCE_DOWN,
    MULTIPLE_INSERT_RESOURCE,
} from '../../constants/lesson/lessonResources';

export const insert = (value) => {
    return {
        type: INSERT_RESOURCE,
        payload: value
    }
};

export const multipleInsert = (values) => {
    return {
        type: MULTIPLE_INSERT_RESOURCE,
        payload: values
    }
};

export const update = (value) => {
    return {
        type: UPDATE_RESOURCE,
        payload: value
    }
};

export const select = (id) => {
    return {
        type: SELECT_RESOURCE,
        payload: id
    }
};

export const remove = (id) => {
    return {
        type: REMOVE_RESOURCE,
        payload: id
    }
};

export const moveUp = (id) => {
    return {
        type: MOVE_RESOURCE_UP,
        payload: id
    }
};

export const moveDown = (id) => {
    return {
        type: MOVE_RESOURCE_DOWN,
        payload: id
    }
};