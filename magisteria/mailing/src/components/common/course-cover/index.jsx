import React from 'react';
import Cover from '../cover';
export default function CourseCover(props) {
    const { course } = props;
    const coverUrl = course.LandCover ? course.LandCover : course.Cover;
    return <Cover imageUrl={coverUrl} linkUrl={course.URL} altText={course.Name}/>;
}
