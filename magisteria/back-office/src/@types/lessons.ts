export type LessonDbInfo = {
  Author: { Id: number, FirstName: string, LastName: string },
  Course: { Id: number, Name: string },
  Id: number,
  IsSubLesson: boolean,
  Name: string,
};
