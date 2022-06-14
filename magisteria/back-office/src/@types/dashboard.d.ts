export declare namespace Dashboard {
    type RecordElement = {
        HasAlert: boolean;
        Id: number;
        Name: string;
        State: number;
    };
    type Record = {
        $css?: string;
        CourseId: number;
        CourseLessonName: string[];
        CourseName: string;
        DateObject: any;
        Elements: RecordElement[];
        IsEndOfWeek: boolean;
        IsEven: boolean;
        IsPublished: boolean;
        IsWeekend: boolean;
        LessonId: number;
        LessonName: string;
        LessonNum: string;
        ProcessId: number;
        ProcessState: number;
        PubDate: string;
        Supervisor: {
            Id: number;
            DisplayName: string;
        };
        SupervisorId: number;
        Week: string;
        WeekendDay?: string;
    };
}
//# sourceMappingURL=dashboard.d.ts.map