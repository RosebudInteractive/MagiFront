export namespace Script {
  export interface Command {
    [key: string]: number[]
  }

  export type SequenceItem = {
    time: number,
    commands: Command[]
  };

  export type SortedItem = SequenceItem & { stepId: number };

  export type ScriptSequence = SequenceItem[];
}
