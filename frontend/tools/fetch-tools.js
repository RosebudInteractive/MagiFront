export function readResponseBody(response) {
    let _reader = response.body.getReader();
    let _data = '';

    return _reader.read().then(function processText({ done, value }) {
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
    return new Promise((resolve, reject) => {
        if (response.status >= 200 && response.status < 300) {
            resolve(response)
        } else {
            readResponseBody(response)
                .then(data => {
                    let _message = response.statusText;

                    if (data) {
                        let _serverError = JSON.parse(data);
                        if (_serverError.hasOwnProperty('message')) {
                            _message = _serverError.message;
                        } else if (_serverError.hasOwnProperty('errors') && Array.isArray(_serverError.errors)) {
                            _message = _serverError.errors.join(',\n')
                        }
                    }
                    let error = new Error(_message);
                    reject(error)
                })
        }
    })
};

export const parseJSON = (response) => {
    return response.json()
};