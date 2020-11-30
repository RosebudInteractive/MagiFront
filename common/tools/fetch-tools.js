import 'whatwg-fetch';

export const NOT_FOUND_ERR = 404;

function readResponseBody(response) {
    let _reader = response.body.getReader();
    let _data = '';

    return _reader.read().then(function processText({done, value}) {
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
    })
}

export const checkStatus = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return readResponseBody(response)
            .then((data) => {
                let _message = response.statusText,
                    _serverError

                if (data) {
                    try {
                        _serverError = JSON.parse(data);
                        if (_serverError.hasOwnProperty('message')) {
                            _message = _serverError.message;
                        } else if (_serverError.hasOwnProperty('errors') && Array.isArray(_serverError.errors)) {
                            _message = _serverError.errors.join(',\n')
                        }
                    } catch (e) {
                        _message = "JSON parse error"
                    }
                }
                let error = new Error(_message);
                error.status = response.status;
                error.response = response;
                if (_serverError) { error.serverData = Object.assign({}, _serverError) }
                throw error
            })
    }
};

export const parseJSON = (response) => {
    return response.json()
};

export const commonGetQuery = (url) => {
    return fetch(url, {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

export const mockFetch = (resultData) => {
    return new Promise((resolve) => {
            resolve({
                status: 200,
                json: (() => {
                    return resultData
                })
            })
        }
    )
}

export const handleJsonError = (error) => {
    return new Promise((resolve) => {
        error.response.json()
            .then(data => {
                let _message = error.response.statusText;

                if (data && data.hasOwnProperty('message')) {
                    _message = data.message;
                }
                resolve(_message)
            })
            .catch(() => {
                resolve(error.message)
            })
    })
};

export function* getErrorMessage(error) {
    let _message
    if (error.response) {
        _message = yield handleJsonError(error)
    } else {
        _message = error.message ? error.message : "unknown error"
    }

    return _message
}