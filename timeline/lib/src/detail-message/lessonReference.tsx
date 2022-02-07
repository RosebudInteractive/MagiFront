import React from 'react';
import { Text, TouchableOpacity, View, Linking } from 'react-native';

import styles from './styles';

type Props = {
  lessonNumber: number,
  lessonName: string,
  url: string,
};

// eslint-disable-next-line react/function-component-definition
export default function LessonReference(props: Props): JSX.Element {
  const { lessonNumber, lessonName, url } = props;

  return (
      <View style={ styles.lessonReferenceBox }>
          <Text style={styles.lessonReferenceHeader}>{`${ lessonNumber }.`}</Text>  
          <TouchableOpacity onPress={ () => Linking.openURL(url) }>
            <Text numberOfLines={1} ellipsizeMode='tail' style={ styles.lessonReferenceItem }>{`${ lessonName }`}</Text>  
          </TouchableOpacity>
      </View>
  );
};
