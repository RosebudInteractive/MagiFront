const _timeout = 100;

class MessageHandler {

    constructor() {
        this._messages = [];
        this._interval = null;
    }

    sendMessageToApp(data) {
        if (!this._trySend(data)) {
            this._addMessageToQueue(data)
        }
    }

    _trySend(data) {
        if (window.postMessage) {
            setTimeout(() => {
                window.postMessage(
                    JSON.stringify(data),
                    '*'
                )
            }, 0)
            return true
        } else {
            return false
        }
    }

    _addMessageToQueue(data) {
        this._messages.push(data)

        this._interval = setInterval(() => {
            if (this._messages.length > 0) {
                if (this._trySend(this._messages[0])) {
                    this._messages.splice(0, 1)
                }
            } else {
                clearInterval(this._interval)
            }
        }, _timeout)
    }
}

const _handler = new MessageHandler()

export const sendMessage = (data) => {
    _handler.sendMessageToApp(data)
}

