import React from 'react';
import './refStyles.sass';

type Props = {
  courseName: string,
  url: string,
};

// eslint-disable-next-line react/function-component-definition
export default function CourseReference(props: Props): JSX.Element {
  const { courseName, url } = props;

  return (
      <div className='course_reference'>
         <div className='course_reference_header'> {`Курс: `} </div>
         <a className='course_reference_item' href={ url }> {`${courseName}`} </a>
      </div>
  );
}

