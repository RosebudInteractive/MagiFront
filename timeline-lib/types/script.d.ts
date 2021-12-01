export declare namespace Script {
    interface Command {
        [key: string]: number[];
    }
    type SequenceItem = {
        time: number;
        commands: Command[];
    };
    type SortedItem = SequenceItem & {
        stepId: number;
    };
    type ScriptSequence = SequenceItem[];
}
