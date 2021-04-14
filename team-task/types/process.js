export type CreatingProcess = {
    Name: string,
    StructId: number,
    SupervisorId: number,
    DueDate: string,
    LessonId: number
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

// export type CreatingProcess = {
//     ProcessId: number,
//     ExecutorId: number,
//     Name: string,
//     ElementId: number,
//     IsElemReady: boolean,
//     Description: string,
//     WriteFieldSet: string,
//     Dependencies: Array,
// }
