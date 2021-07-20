class Emitter{
    constructor() {
        this._listeners = []
    }

    addListener(type, callback) {
        this._listeners.push({type, callback})
    }

    emit(type, args) {
        this._listeners.forEach((listener) => {
            if ((listener.type === type) && (listener.callback)) {
                listener.callback(args)
            }
        })
    }
}

const emitter = new Emitter()

export default emitter
