import {COMMENT_ACTION,} from "../constants/common";

export type UpdatingTask = {
    Id: number,
    Name: string,
    State: number,
    ExecutorId: ?number,
    DueDate: Date,
    Description: string,
    ElementId: number,
    IsElemReady: boolean,
    WriteFieldSet: ?string,
    Comment: ?string,
    Fields: { [string]: ?string }
}

export type UpdatingCommentData = {
    id: number,
    text: ?string,
    action: $Values<typeof COMMENT_ACTION>
}

export type UpdatingTaskData = {
    task: UpdatingTask,
    comment: ?UpdatingCommentData,
}

export type ProcessTask = {
    taskId: number,
    processId: number,
}
