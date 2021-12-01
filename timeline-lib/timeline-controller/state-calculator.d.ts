import { ScriptPlayer } from '../types/controller';
export default class StateCalculator implements ScriptPlayer.IStateCalculator {
    private readonly controller;
    constructor(controller: ScriptPlayer.IController);
    forwardTo(newTime: number, stepId?: number): void;
    backwardTo(newTime: number, stepId?: number): void;
    calculateState(newTime: number, backward: boolean, stepId?: number): void;
}
