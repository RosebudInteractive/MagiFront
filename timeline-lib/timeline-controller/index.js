import StateCalculator from './state-calculator';
import emitter from './emitter';
const INVERSE_COMMANDS = {
    showEvents: 'hideEvents',
    hideEvents: 'showEvents',
    hidePeriods: 'showPeriods',
    showPeriods: 'hidePeriods',
};
class TimelineController {
    currentTime;
    script;
    maxTimeValue;
    changeCallback;
    calculator;
    events;
    periods;
    constructor() {
        this.currentTime = 0;
        this.maxTimeValue = 0;
        this.events = null;
        this.periods = null;
        this.script = null;
        this.changeCallback = null;
        this.calculator = new StateCalculator(this);
        this.bindEvents();
    }
    init(data, callback) {
        this.events = new Map(data.events.map((event) => ([event.id, { ...event, visible: true }])));
        // eslint-disable-next-line max-len
        this.periods = new Map(data.periods.map((period) => ([period.id, { ...period, visible: true }])));
        this.script = data.sequence
            .map((item, index) => ({ ...item, stepId: index + 1 }))
            .sort((a, b) => a.time - b.time);
        this.maxTimeValue = this.script[this.script.length - 1].time;
        this.changeCallback = callback;
    }
    getState() {
        return {
            events: (this.events) ? [...this.events.values()] : [],
            periods: (this.periods) ? [...this.periods.values()] : [],
            time: this.currentTime,
        };
    }
    applyCommands(commandsArray, asReverse = false) {
        const commands = asReverse ? [...commandsArray].reverse() : commandsArray;
        commands.forEach((command) => {
            const commandIs = Object.entries(command).map((val) => [val[0], val[1]])[0];
            const fnName = asReverse
                // @ts-ignore
                ? INVERSE_COMMANDS[commandIs[0].toString()]
                : commandIs[0].toString();
            switch (fnName) {
                case 'showPeriods':
                    // @ts-ignore
                    this.showPeriods(commandIs[1]);
                    break;
                case 'showEvents':
                    // @ts-ignore
                    this.showEvents(commandIs[1]);
                    break;
                case 'hidePeriods':
                    // @ts-ignore
                    this.hidePeriods(commandIs[1]);
                    break;
                case 'hideEvents':
                    // @ts-ignore
                    this.hideEvents(commandIs[1]);
                    break;
                default:
            }
        });
    }
    bindEvents() {
        emitter.addListener('timeStampReceived', (ev) => {
            this.playImmediately(ev.detail.time);
        });
        emitter.addListener('forwardTimeStamp', (ev) => {
            this.rewindTo({ timeStamp: ev.detail.time });
        });
        emitter.addListener('backwardTimeStamp', (ev) => {
            this.rewindTo({ timeStamp: ev.detail.time, backward: true });
        });
    }
    onChangeState() {
        if (this.changeCallback) {
            (this.changeCallback(this.getState()));
        }
    }
    rewindTo({ timeStamp, backward = false }) {
        if (backward) {
            this.calculator.backwardTo(timeStamp);
        }
        else {
            this.calculator.forwardTo(timeStamp);
        }
        this.currentTime = timeStamp;
        this.onChangeState();
    }
    playImmediately(timeStamp) {
        this.currentTime = timeStamp;
        if (!(this.script && this.script.length) || (timeStamp > this.maxTimeValue)) {
            return;
        }
        const sequenceToPlay = this.script
            .find((seq) => seq.time === timeStamp);
        if (sequenceToPlay) {
            this.applyCommands(sequenceToPlay.commands);
            this.onChangeState();
        }
    }
    showEvents(eventIds = []) {
        if (eventIds.length === 0) {
            // eslint-disable-next-line no-param-reassign
            if (this.events)
                this.events.forEach((v) => { v.visible = true; });
        }
        else {
            eventIds.forEach((eventId) => {
                const event = this.events && this.events.get(eventId);
                if (event)
                    event.visible = true;
            });
        }
    }
    hideEvents(eventIds = []) {
        if (eventIds.length === 0) {
            // eslint-disable-next-line no-param-reassign
            if (this.events)
                this.events.forEach((v) => { v.visible = false; });
        }
        else {
            eventIds.forEach((id) => {
                const event = this.events && this.events.get(id);
                if (event)
                    event.visible = false;
            });
        }
    }
    showPeriods(periodIds = []) {
        if (periodIds.length === 0) {
            // eslint-disable-next-line no-param-reassign
            if (this.periods)
                this.periods.forEach((v) => { v.visible = true; });
        }
        else {
            periodIds.forEach((id) => {
                const period = this.periods && this.periods.get(id);
                if (period)
                    period.visible = true;
            });
        }
    }
    hidePeriods(periodIds = []) {
        if (periodIds.length === 0) {
            // eslint-disable-next-line no-param-reassign
            if (this.periods)
                this.periods.forEach((v) => { v.visible = false; });
        }
        else {
            periodIds.forEach((id) => {
                const period = this.periods && this.periods.get(id);
                if (period)
                    period.visible = false;
            });
        }
    }
}
const instance = new TimelineController();
export default instance;
