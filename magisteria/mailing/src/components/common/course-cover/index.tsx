import React from 'react';
import Cover from '../cover';
import type { Course } from '#types/course';

type Props = {
  course: Course,
};

export default function CourseCover(props: Props) {
  const { course } = props;
  const coverUrl = course.LandCover ? course.LandCover : course.Cover;

  return <Cover imageUrl={coverUrl} linkUrl={course.URL} altText={course.Name} />;
}
