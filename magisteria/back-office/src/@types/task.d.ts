export declare type Task = {
    Id: number;
    Name: string;
    State: TaskState;
    DueDate: string;
    IsFinal: boolean;
    IsAutomatic: boolean;
    IsActive: boolean;
    Executor?: {
        Id: number;
        DisplayName: string;
    };
};
export declare type TaskState = 1 | 2 | 3 | 4 | 5;
//# sourceMappingURL=task.d.ts.map