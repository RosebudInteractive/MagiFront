
export default class StateCalculator {
    constructor(controller) {
        this.controller = controller
    }

    forwardTo(newTime: number, stepId: number) {
        this._calculateState(newTime, false, stepId);
    }

    backwardTo(newTime: number, stepId: number) {
        this._calculateState(newTime, true, stepId)
    }

    _calculateState(newTime, backward, stepId) {
        const _currentTime = this.controller.currentTime;
        let iterationsToSuperimpose = this.controller.script.filter(step => ((backward) ?
            (step.time <= _currentTime && step.time >= newTime) :
            (step.time >= _currentTime && step.time <= newTime))
        );
        if (newTime && !stepId) {
            if (iterationsToSuperimpose && iterationsToSuperimpose.length > 0) {
                iterationsToSuperimpose = [...iterationsToSuperimpose]
                    .sort((a, b) => backward ? b.stepId - a.stepId : a.stepId - b.stepId);

                iterationsToSuperimpose.forEach((iteration, index) => {
                    const commands = iteration.commands;

                    if(backward){
                            index < iterationsToSuperimpose.length - 1 && this.controller.applyCommands(commands, backward);
                    } else {
                        this.controller.applyCommands(commands, backward);
                    }

                })

            }
        }
    }
}
