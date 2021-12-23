import { Event } from './event';
import { Period } from './period';
import { Script } from './script';

export namespace ScriptPlayer {
  export declare interface IStateCalculator {
    forwardTo(newTime: number, stepId: number): void;

    backwardTo(newTime: number, stepId: number): void;
  }

  export declare interface IController {
    currentTime: number;
    script: Script.SortedItem[] | null;

    applyCommands(commandsArray: Array<any>, asReverse: boolean): void
  }

  export type State = {
    events: Event.VisualItem[],
    periods: Period.VisualItem[],
    time: number,
  };

  export type Data = {
    events: Event.VisualItem[],
    periods: Period.VisualItem[],
    sequence: Script.ScriptSequence,
  };
}
