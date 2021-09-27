export default class StateCalculator {
    controller;
    constructor(controller) {
        this.controller = controller;
    }
    forwardTo(newTime, stepId) {
        this.calculateState(newTime, false, stepId);
    }
    backwardTo(newTime, stepId) {
        this.calculateState(newTime, true, stepId);
    }
    // todo: разобраться со stepId
    calculateState(newTime, backward, stepId) {
        const { currentTime, script } = this.controller;
        let iterationsToSuperimpose = script && script.filter((step) => ((backward)
            ? (step.time <= currentTime && step.time >= newTime)
            : (step.time >= currentTime && step.time <= newTime)));
        if (newTime && !stepId) {
            if (iterationsToSuperimpose && iterationsToSuperimpose.length > 0) {
                iterationsToSuperimpose = iterationsToSuperimpose
                    .sort((a, b) => (backward ? b.stepId - a.stepId : a.stepId - b.stepId));
                iterationsToSuperimpose.forEach((iteration, index) => {
                    const { commands } = iteration;
                    if (backward) {
                        if (iterationsToSuperimpose && (index < iterationsToSuperimpose.length - 1)) {
                            this.controller.applyCommands(commands, backward);
                        }
                    }
                    else {
                        this.controller.applyCommands(commands, backward);
                    }
                });
            }
        }
    }
}
