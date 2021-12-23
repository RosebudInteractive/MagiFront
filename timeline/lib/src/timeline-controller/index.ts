import StateCalculator from './state-calculator';
import emitter from './emitter';
import { Event } from '../types/event';
import { Period } from '../types/period';
import { ScriptPlayer } from '../types/controller';
import { Script } from '../types/script';

const INVERSE_COMMANDS = {
  showEvents: 'hideEvents',
  hideEvents: 'showEvents',
  hidePeriods: 'showPeriods',
  showPeriods: 'hidePeriods',
};

type RewindData = {
  timeStamp: number,
  backward?: boolean
};

class TimelineController implements ScriptPlayer.IController {
  currentTime: number;

  script: Script.SortedItem[] | null;

  private maxTimeValue: number;

  private changeCallback: Function | null;

  private calculator: StateCalculator;

  private events: Map<number, Event.VisualItem> | null;

  private periods: Map<number, Period.VisualItem> | null;

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

  public init(data: ScriptPlayer.Data, callback: Function): void {
    this.events = new Map(data.events.map((event) => ([event.id, { ...event, visible: true }])));
    // eslint-disable-next-line max-len
    this.periods = new Map(data.periods.map((period) => ([period.id, { ...period, visible: true }])));

    this.script = data.sequence
      .map((item, index) => ({ ...item, stepId: index + 1 }))
      .sort((a, b) => a.time - b.time);

    this.maxTimeValue = this.script[this.script.length - 1].time;

    this.changeCallback = callback;
  }

  public getState(): ScriptPlayer.State {
    return {
      events: (this.events) ? [...this.events.values()] : [],
      periods: (this.periods) ? [...this.periods.values()] : [],
      time: this.currentTime,
    };
  }

  public applyCommands(commandsArray: Script.Command[], asReverse: boolean = false): void {
    const commands = asReverse ? [...commandsArray].reverse() : commandsArray;

    commands.forEach((command: Script.Command) => {
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

  private bindEvents() {
    emitter.addListener('timeStampReceived', (ev: { detail: { time: number } }) => {
      this.playImmediately(ev.detail.time);
    });

    emitter.addListener('forwardTimeStamp', (ev: { detail: { time: number } }) => {
      this.rewindTo({ timeStamp: ev.detail.time });
    });

    emitter.addListener('backwardTimeStamp', (ev: { detail: { time: number } }) => {
      this.rewindTo({ timeStamp: ev.detail.time, backward: true });
    });
  }

  private onChangeState() {
    if (this.changeCallback) {
      (this.changeCallback(this.getState()));
    }
  }

  private rewindTo({ timeStamp, backward = false }: RewindData): void {
    if (backward) {
      this.calculator.backwardTo(timeStamp);
    } else {
      this.calculator.forwardTo(timeStamp);
    }
    this.currentTime = timeStamp;
    this.onChangeState();
  }

  private playImmediately(timeStamp: number) {
    this.currentTime = timeStamp;

    if (!(this.script && this.script.length) || (timeStamp > this.maxTimeValue)) { return; }

    const sequenceToPlay: Script.SortedItem | undefined = this.script
      .find((seq) => seq.time === timeStamp);

    if (sequenceToPlay) {
      this.applyCommands(sequenceToPlay.commands);
      this.onChangeState();
    }
  }

  private showEvents(eventIds = []) {
    if (eventIds.length === 0) {
      // eslint-disable-next-line no-param-reassign
      if (this.events) this.events.forEach((v) => { v.visible = true; });
    } else {
      eventIds.forEach((eventId) => {
        const event = this.events && this.events.get(eventId);
        if (event) event.visible = true;
      });
    }
  }

  private hideEvents(eventIds = []) {
    if (eventIds.length === 0) {
      // eslint-disable-next-line no-param-reassign
      if (this.events) this.events.forEach((v) => { v.visible = false; });
    } else {
      eventIds.forEach((id) => {
        const event = this.events && this.events.get(id);
        if (event) event.visible = false;
      });
    }
  }

  private showPeriods(periodIds: number[] = []) {
    if (periodIds.length === 0) {
      // eslint-disable-next-line no-param-reassign
      if (this.periods) this.periods.forEach((v) => { v.visible = true; });
    } else {
      periodIds.forEach((id) => {
        const period = this.periods && this.periods.get(id);
        if (period) period.visible = true;
      });
    }
  }

  hidePeriods(periodIds = []) {
    if (periodIds.length === 0) {
      // eslint-disable-next-line no-param-reassign
      if (this.periods) this.periods.forEach((v) => { v.visible = false; });
    } else {
      periodIds.forEach((id) => {
        const period = this.periods && this.periods.get(id);
        if (period) period.visible = false;
      });
    }
  }
}

const instance: TimelineController = new TimelineController();

export default instance;
