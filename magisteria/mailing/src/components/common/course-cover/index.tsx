import React from "react"
import Cover from "../cover";

type Props = {
  course: any,
}

export default function CourseCover(props: Props) {

  const {course} = props,
    coverUrl = course.LandCover ? course.LandCover : course.Cover

  return <Cover imageUrl={coverUrl} linkUrl={course.URL} altText={course.Name} />
}

