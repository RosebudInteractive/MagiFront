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