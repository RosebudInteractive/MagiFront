const INTERVAL_TIMEOUT = 100;

class MessageHandler {

    constructor() {
        this._messages = [];
        this._interval = null;
        this.isPostчMessageLoaded = false
    }

    sendMessageToApp(data) {
      this._trySend(data)
    }

    _trySend(data) {
      if( !this.isPostMessageLoaded ) {
          this.isPostMessageLoaded = /ReactNative|__REACT_WEB_VIEW_BRIDGE/.test( window.postMessage.toString() )
      }

      if( this.isPostMessageLoaded ) {
          window.postMessage(
              JSON.stringify(data)
          )
          return
      }

      this._addMessageToQueue(data)
    }

    _addMessageToQueue(data) {
        this._messages.push(data)

        this.setInterval()
    }

    setInterval() {
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
