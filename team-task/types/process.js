export type CreatingProcess = {
    Name: string,
    StructId: number,
    SupervisorId: number,
    DueDate: string,
    LessonId: number,
    Params: CreatingProcessParams
}

export type CreatingProcessParams = {
    UseAuthorPictures: boolean,
    UseMusic: boolean,
    ExecutorSound: number,
    ExecutorSoundControl: number,
    ExecutorTranscript: number,
    ExecutorPictures: number,
    ExecutorPicturesControl: number,
    ExecutorText: number,
    ExecutorLiterature: number
}

export type UpdatingProcess = {
    Id: number,
    State: number,
    SupervisorId: number,
    Name: string,
    DueDate: string
}

export type CreatingElement = {
    ProcessId: ?number,
    ElementId: number,
    SupervisorId: number,
}

export type UpdatingElement = {
    ElementId: number,
    SupervisorId: number,
    State: number
}

export type Tree = {
    colCount: number,
    rowCount: number,
    lines: Array<TreeLine>,
    nodes: any
}

type TreeLine = {
    from: number,
    to: number
}
