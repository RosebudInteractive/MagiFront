import {
    GET_AUTHORS_LIST_REQUEST,
    GET_AUTHORS_LIST_SUCCESS,
    GET_AUTHORS_LIST_FAIL,
    SELECT_AUTHOR,
    DELETE_AUTHOR_SUCCESS,
} from '../constants/authorsList';

import {
    HIDE_DELETE_DLG,
    SHOW_ERROR_DIALOG,
} from '../constants/Common';

import 'whatwg-fetch';

export const getAuthors = () => {
    return (dispatch) => {
        dispatch({
            type: GET_AUTHORS_LIST_REQUEST,
            payload: null
        });

        fetch("/api/authors", {credentials: 'include'})
            .then(checkStatus)
            .then(parseJSON)
            .then(data => {
                data.forEach((author) => handleAuthor(author));

                dispatch({
                    type: GET_AUTHORS_LIST_SUCCESS,
                    payload: data
                })
            })
            .catch((err) => {
                // err.response.json()
                //     .then((object) => {
                //         dispatch({
                //             type: GET_AUTHORS_LIST_FAIL,
                //             payload: object.message
                //         })
                //     })
                //     .catch((err) => {
                //         console.log(err)
                //     })

                let _reader = err.response.body.getReader();
                let _data = '';

                _reader.read().then(function processText({ done, value }) {
                    // Result objects contain two properties:
                    // done  - true if the stream has already given you all its data.
                    // value - some data. Always undefined when done is true.
                    if (done) {
                        return _data;
                    }

                    // value for fetch streams is a Uint8Array
                    // charsReceived += value.length;
                    const chunk = new TextDecoder("utf-8").decode(value);
                    // let listItem = document.createElement('li');
                    // listItem.textContent = 'Received ' + charsReceived + ' characters so far. Current chunk = ' + chunk;
                    // list2.appendChild(listItem);

                    _data += chunk;

                    // Read some more, and call this function again
                    return _reader.read().then(processText);
                }).then((data) => {
                    dispatch({
                        type: GET_AUTHORS_LIST_FAIL,
                        payload: data
                    })
                });

            });

    }
};

export const selectAuthor = (id) => {
    return {
        type: SELECT_AUTHOR,
        payload: id
    }
};

export const deleteAuthor = (id) => {
    return (dispatch) => {
        fetch("/api/authors/" + id,
            {
                method: "DELETE",
                credentials: 'include'
            })
            .then(checkStatus)
            .then(parseJSON)
            .then(() => {
                dispatch({
                    type: DELETE_AUTHOR_SUCCESS,
                    payload: id
                })
            })
            .then(() => {
                dispatch({
                    type: HIDE_DELETE_DLG,
                    payload: null,
                })
            })
            .catch((err) => {
                dispatch({
                    type: SHOW_ERROR_DIALOG,
                    payload: err.message
                })
            });

    }
};

export const cancelDelete = () => {
    return (dispatch) => {
        dispatch({
            type: HIDE_DELETE_DLG,
            payload: null,
        })
    }

};

const checkStatus = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error
    }
};

const parseJSON = (response) => {
    return response.json()
};

const handleAuthor = (author) => {
    author.id = author.Id;
    return author;
};