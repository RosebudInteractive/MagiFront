import React from 'react';
import { Text, TouchableOpacity, View, GestureResponderEvent} from 'react-native';
import CourseReference from './courseReference';
import LessonReference from './lessonReference';
import styles from './styles';
import { VisualItem } from '../types/common';
import { References as ReferencesType} from '../types/references';

type Props = {
  item: VisualItem,
  onPressClose: (event: GestureResponderEvent) => void,
  references: ReferencesType
};

// eslint-disable-next-line react/function-component-definition
export default function References(props: Props): JSX.Element {
  const { item, onPressClose, references } = props;
  const courses = references.courses || [];
  const lessons = references.lessons || [];
  const itemRefs = item.references || [];
  const distinctCourses = new Map();

  for (const aRefArr of itemRefs) {
    const refLen = aRefArr.length;
    if (refLen > 0){
      const courseIdx = aRefArr[0];
      if (courseIdx >=-1 && courseIdx < courses.length) {
        const lessonIdx = (refLen > 1 && aRefArr[1] >=0 && (aRefArr[1] < lessons.length) )?aRefArr[1]:-1;
        let lessonsArr = distinctCourses.get(courseIdx);
        if (!lessonsArr)
          distinctCourses.set(courseIdx, (lessonIdx==-1)?[]:[lessonIdx])
        else 
          lessonsArr.push(lessonIdx);
      };
    };
  };

  const sortedCourses = Array.from(distinctCourses.keys()).sort();
  for (const aRefKey of distinctCourses.keys())
    (distinctCourses.get(aRefKey) || []).sort();

  let countOfTitles = 0;

  const getCourseTitle = (idx: number) => {
    if (idx==-1)
      return <Text style={styles.references}>{`Упоминания в этом курсе`}</Text>;
    else 
      return (
        <View>
          { (countOfTitles++==0)?<Text style={ styles.references }>{`В других курсах`}</Text>:null }
          <CourseReference courseName= { courses[idx].name } url = { courses[idx].url }/>
        </View>
      );
  };

  const getRefsToLessons = (aRef:number[]) => {
    return (
      aRef.map( (idx:number)=>
          <LessonReference lessonName={ lessons[idx].name } lessonNumber={ lessons[idx].number } url={ lessons[idx].url } ></LessonReference>
      )
    )
  };
  
  const referencesJsx = sortedCourses.map( ( elem ) => {
    return (
      <View style={styles.references}>
        { getCourseTitle( elem ) }
        { getRefsToLessons( distinctCourses.get(elem) ) }
      </View>
    )
  });

  return (
    <div>
      {referencesJsx}
      <TouchableOpacity onPress={ onPressClose }>
        <Text style={styles.description}>{`Свернуть`}</Text>  
      </TouchableOpacity>
    </div>
  )
}
