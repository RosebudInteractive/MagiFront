import React from 'react';
import './refStyles.sass';

type Props = {
  lessonNumber: number,
  lessonName: string,
  url: string,
};

// eslint-disable-next-line react/function-component-definition
export default function LessonReference(props: Props): JSX.Element {
  const { lessonNumber, lessonName, url } = props;

  return (
      <div className='lesson_reference_box'>
         <div className='lesson_reference_header'> { `${ lessonNumber }.`} </div>
         <a className='lesson_reference_item' href={ url }> {`${lessonName}`} </a>
      </div>
  );
}

