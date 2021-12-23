import emitter from '@rosebud/timeline/src/timeline-controller/emitter';

const INTERVAL = 500;
export const SCRIPT_DEFAULT_TIME = 25;

class Generator{

    constructor() {
        this._currentTime = 0;
        this._timer = null;
    }

    play(time = SCRIPT_DEFAULT_TIME) {
        this._timer = setInterval(() => {
            this._currentTime += INTERVAL;

            if(this._currentTime >= (time * 1000)){
                clearInterval(this._timer);
                this._currentTime = 0;

                emitter.emit('stoppedTimeStamp');
            } else {
                emitter.emit('timeStampReceived', {
                    detail: {time: (this._currentTime)}
                });
            }
        }, INTERVAL)
    }

    stop() {
        if (this._timer) {
            clearInterval(this._timer)
        }

        this._currentTime = 0
        emitter.emit('stoppedTimeStamp');
    }

    pause() {
        if (this._timer) {
            clearInterval(this._timer)
        }
    }

    forward(delta) {
        this._currentTime += delta

        emitter.emit('forwardTimeStamp', {
            detail: {time: (this._currentTime)}
        });
    }

    backward(delta) {
        const _newValue = this._currentTime - delta;

        this._currentTime = _newValue > 0 ? _newValue : 0;

        emitter.emit('backwardTimeStamp', {
            detail: {time: (this._currentTime)}
        });
    }
}

const _generator = new Generator();

export default _generator;
