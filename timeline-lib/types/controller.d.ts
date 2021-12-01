import { Event } from './event';
import { Period } from './period';
import { Script } from './script';
export declare namespace ScriptPlayer {
    interface IStateCalculator {
        forwardTo(newTime: number, stepId: number): void;
        backwardTo(newTime: number, stepId: number): void;
    }
    interface IController {
        currentTime: number;
        script: Script.SortedItem[] | null;
        applyCommands(commandsArray: Array<any>, asReverse: boolean): void;
    }
    type State = {
        events: Event.VisualItem[];
        periods: Period.VisualItem[];
        time: number;
    };
    type Data = {
        events: Event.VisualItem[];
        periods: Period.VisualItem[];
        sequence: Script.ScriptSequence;
    };
}
