import { ScriptPlayer } from '../types/controller';
import { Script } from '../types/script';

export default class StateCalculator implements ScriptPlayer.IStateCalculator {
  private readonly controller: ScriptPlayer.IController;

  constructor(controller: ScriptPlayer.IController) {
    this.controller = controller;
  }

  public forwardTo(newTime: number, stepId?: number): void {
    this.calculateState(newTime, false, stepId);
  }

  public backwardTo(newTime: number, stepId?: number): void {
    this.calculateState(newTime, true, stepId);
  }

  // todo: разобраться со stepId
  calculateState(newTime: number, backward: boolean, stepId?: number) {
    const { currentTime, script } = this.controller;

    let iterationsToSuperimpose = script && script.filter((step: Script.SortedItem) => ((backward)
      ? (step.time <= currentTime && step.time >= newTime)
      : (step.time >= currentTime && step.time <= newTime)));

    if (newTime && !stepId) {
      if (iterationsToSuperimpose && iterationsToSuperimpose.length > 0) {
        iterationsToSuperimpose = iterationsToSuperimpose
          .sort((a: Script.SortedItem, b: Script.SortedItem) => (
            backward ? b.stepId - a.stepId : a.stepId - b.stepId
          ));

        iterationsToSuperimpose.forEach((iteration: Script.SortedItem, index: number) => {
          const { commands } = iteration;

          if (backward) {
            if (iterationsToSuperimpose && (index < iterationsToSuperimpose.length - 1)) {
              this.controller.applyCommands(commands, backward);
            }
          } else {
            this.controller.applyCommands(commands, backward);
          }
        });
      }
    }
  }
}
