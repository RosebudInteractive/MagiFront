const INTERVAL_TIMEOUT = 100;

class MessageHandler {

    constructor() {
        this._messages = [];
        this._interval = null;
    }

    sendMessageToApp(data) {
        this._trySend(data)
    }

    _trySend(data) {
        Promise.resolve()
            .then(() => {
                window.postMessage(
                    JSON.stringify(data)
                )
            })
            .catch((e) => {
                console.log('postMessage err', e)

                this._addMessageToQueue(data)
            })
    }

    _addMessageToQueue(data) {
        this._messages.push(data)

        this._internalSetInterval()
    }

    _internalSetInterval() {
        clearInterval(this._interval)
        if (this._messages.length === 0) {
            return
        }

        this._interval = setInterval(() => {
            if (this._messages.length === 0) {
                clearInterval(this._interval)
                return
            }

            const data = this._messages[0]
            this._messages.splice(0, 1)
            this._trySend(data)
        }, INTERVAL_TIMEOUT)
    }
}

const _handler = new MessageHandler()

export const sendMessage = (data) => {
    _handler.sendMessageToApp(data)
}
