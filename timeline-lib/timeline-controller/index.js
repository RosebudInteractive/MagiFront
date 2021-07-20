import StateCalculator from "./state-calculator";
import emitter from './emitter';

const INVERSE_COMMANDS = {
  showEvents: 'hideEvents',
  hideEvents: 'showEvents',
  hidePeriods: 'showPeriods',
  showPeriods: 'hidePeriods'
};

class TimelineController {

    constructor() {
        this.currentTime = 0
        this.maxTimeValue = 0

        this.changeCallback = null;
        this._calculator = new StateCalculator(this);

        this._bindEvents()
    }

    init({events, periods}, sequence, callback) {
        this.events = new Map(events.map(event => ([event.id, {...event, visible: true}])));
        this.periods = new Map(periods.map(period => ([period.id, {...period, visible: true}])));

        this.script = sequence
            .map((item, index) => { return {...item, stepId: index + 1} })
            .sort((a, b) => a.time - b.time);

        this.maxTimeValue = this.script[this.script.length - 1].time;

        this.changeCallback = callback
    }

    getState() {
        return {
            events: (this.events) ? [...this.events.values()] : [],
            periods: (this.periods) ? [...this.periods.values()] : [],
            time: this.currentTime
        }
    }

    _bindEvents() {
        emitter.addListener('timeStampReceived', (ev) => {
            this._playImmediately(ev.detail.time);
        })

        emitter.addListener('forwardTimeStamp', (ev) => {
            this.rewindTo({timeStamp: ev.detail.time});
        });

        emitter.addListener('backwardTimeStamp', (ev) => {
            this.rewindTo({timeStamp: ev.detail.time, backward: true});
        });
    }

    _onChangeState() {
        if (this.changeCallback) {
            (this.changeCallback(this.getState()))
        }
    }

    rewindTo({stepId = null, timeStamp = null, backward = false}) {
        backward ?
            this._calculator.backwardTo(timeStamp) :
            this._calculator.forwardTo(timeStamp);
        this.currentTime = timeStamp;
        this._onChangeState()
    }

    _playImmediately(timeStamp) {
        this.currentTime = timeStamp

        if (!this.script || (timeStamp > this.maxTimeValue)) { return }

        let sequenceToPlay = this.script.length && this.script.find(seq => seq.time === timeStamp);

        if(sequenceToPlay){
            this.applyCommands(sequenceToPlay.commands);
            this._onChangeState()
        }
    }

    applyCommands(commandsArray, asReverse = false) {
        const commands = asReverse ? [...commandsArray].reverse() : commandsArray;

        commands.forEach((command, index) => {

            let commandIs = Object.entries(command).map((val, key) => {
                return [val[0], val[1]];
            })[0];
            let fnName = asReverse ? INVERSE_COMMANDS[commandIs[0].toString()] : commandIs[0].toString();

            switch (fnName) {
                case 'showPeriods':
                    this.showPeriods(commandIs[1]);
                    break;
                case 'showEvents':
                    this.showEvents(commandIs[1]);
                    break;
                case 'hidePeriods':
                    this.hidePeriods(commandIs[1]);
                    break;
                case 'hideEvents':
                    this.hideEvents(commandIs[1]);
                    break;
                default:
                    return;
            }
        })
    }

    showEvents(eventIds = []) {
        if (eventIds.length === 0) {
            this.events.forEach((v) => { v.visible = true; });
        } else {
            eventIds.forEach(eventId => {
                this.events.get(eventId).visible = true
            });
        }
    }

    hideEvents(eventIds = []) {
        if (eventIds.length === 0) {
            this.events.forEach((v) => { v.visible = false });
        } else {
            eventIds.forEach(id => { this.events.get(id).visible = false });
        }
    }

    showPeriods(periodIds = []) {
        if (periodIds.length === 0) {
            this.periods.forEach((v) => { v.visible = true; });
        } else {
            periodIds.forEach(x => { this.periods.get(x).visible = true });
        }
    }

    hidePeriods(periodIds = []) {
        if (periodIds.length === 0) {
            this.periods.forEach((v) => { v.visible = false; });
        } else {
            periodIds.forEach(x => { this.periods.get(x).visible = false });
        }
    }
}


export default new TimelineController()
