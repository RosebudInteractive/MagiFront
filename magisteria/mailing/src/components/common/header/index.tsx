import React from 'react';
import CourseCover from '#src/components/common/course-cover';
import type { Course } from '#types/course';

type Styles = {
  TITLE: React.CSSProperties,
  IMG: React.CSSProperties,
  COURSE: {
    WRAPPER: React.CSSProperties,
    TITLE: React.CSSProperties,
    NAME: React.CSSProperties,
  },
  LINK: React.CSSProperties,
  AUTHOR: React.CSSProperties,
};

const STYLE: Styles = {
  TITLE: {
    fontFamily: 'Arial',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '12px',
    lineHeight: '140%',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '20px 0 15px',
    color: '#2B2B2B',
  },
  COURSE: {
    WRAPPER: {
      paddingBottom: '20px',
    },
    TITLE: {
      display: 'inline',
      fontFamily: 'Georgia',
      fontStyle: 'italic',
      fontWeight: 'normal',
      fontSize: '24px',
      lineHeight: '120%',
      color: '#C8684C',
    },
    NAME: {
      display: 'inline',
      fontFamily: 'Georgia',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '24px',
      lineHeight: '120%',
      color: '#2F2F2F',
    },
  },
  IMG: {
    border: 0,
    width: '100%',
    display: 'block',
  },
  LINK: {
    textDecoration: 'none',
  },
  AUTHOR: {
    fontFamily: 'Arial',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '15px',
    lineHeight: '140%',
    color: '#2F2F2F',
    display: 'inline',
  },
};

export interface HeaderProps {
  course: Course
}

const Header = ({ course } : HeaderProps) => {
  const authors = course.Authors.map((author) => `${author.FirstName} ${author.LastName}`).join(', ');

  return (
    <>
      <tr>
        <td style={STYLE.TITLE}>Новый курс</td>
      </tr>
      <tr>
        <td>
          <a target="_blank" href={course.URL} rel="noreferrer" style={STYLE.LINK}>
            <span style={STYLE.COURSE.TITLE}>Курс: </span>
            <span style={STYLE.COURSE.NAME}>{course.Name}</span>
          </a>
        </td>
      </tr>
      <tr>
        <td style={STYLE.COURSE.WRAPPER}>
          <span style={STYLE.AUTHOR}>{authors}</span>
        </td>
      </tr>
      <tr>
        <CourseCover course={course} />
      </tr>
    </>
  );
};

export default Header;
