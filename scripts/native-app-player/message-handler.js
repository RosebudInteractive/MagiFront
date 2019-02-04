const INTERVAL_TIMEOUT = 100
const REACT_NATIVE_INTERFACE = 'ReactNativeWebView'


class MessageHandler {

    constructor() {
        this._messages = [];
        this._interval = null;
        this.isReactNativeInterfaceLoaded = false
    }

    sendMessageToApp(data) {
        this._trySend(data)
    }

    _trySend(data) {
        if( !this.isReactNativeInterfaceLoaded ) {
            this.isReactNativeInterfaceLoaded = window[REACT_NATIVE_INTERFACE] != null
        }

        if( this.isReactNativeInterfaceLoaded ) {
            window[REACT_NATIVE_INTERFACE].postMessage(
                JSON.stringify(data)
            )
            return
        }

        this._addMessageToQueue(data)
    }

    _addMessageToQueue(data) {
        this._messages.push(data)

        this._setInterval()
    }

    _setInterval() {
        clearInterval(this._interval)
        if( this._messages.length === 0 ) {
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
