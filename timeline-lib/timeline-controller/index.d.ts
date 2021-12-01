import { ScriptPlayer } from '../types/controller';
import { Script } from '../types/script';
declare class TimelineController implements ScriptPlayer.IController {
    currentTime: number;
    script: Script.SortedItem[] | null;
    private maxTimeValue;
    private changeCallback;
    private calculator;
    private events;
    private periods;
    constructor();
    init(data: ScriptPlayer.Data, callback: Function): void;
    getState(): ScriptPlayer.State;
    applyCommands(commandsArray: Script.Command[], asReverse?: boolean): void;
    private bindEvents;
    private onChangeState;
    private rewindTo;
    private playImmediately;
    private showEvents;
    private hideEvents;
    private showPeriods;
    hidePeriods(periodIds?: never[]): void;
}
declare const instance: TimelineController;
export default instance;
