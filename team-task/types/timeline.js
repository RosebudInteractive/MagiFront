export type TypeOfUse = "Course" | "Lecture";
export type TimelineStatus = "Draft" | "Published";


export type Timeline = {
    TimeCr: string,
    Name: string,
    TypeOfUse: TypeOfUse,
    Code: number,
    Course: any,
    Lesson: any,
    NameOfLectionOrCourse: string,
    State: TimelineStatus,
    OrderNumber: number,
    HasScript: boolean
}


