class Emitter {
    constructor() {
        this.listeners = [];
    }
    addListener(type, callback) {
        this.listeners.push({ type, callback });
    }
    emit(type, args) {
        this.listeners.forEach((listener) => {
            if ((listener.type === type) && (listener.callback)) {
                listener.callback(args);
            }
        });
    }
}
const emitter = new Emitter();
export default emitter;
