import React from 'react';
import { Text, TouchableOpacity, View, Linking } from 'react-native';

import styles from './styles';

type Props = {
  courseName: string,
  url: string,
};

// eslint-disable-next-line react/function-component-definition
export default function CourseReference(props: Props): JSX.Element {
  const { courseName, url } = props;

  return (
      <View style={styles.courseReference}>
          <Text style={[styles.courseReferenceItem,{width:"auto"}]}>{`Курс: `}</Text>
          <TouchableOpacity onPress={ () => Linking.openURL(url) }>
            <Text numberOfLines={1} style={styles.courseReferenceItem}>{`${ courseName }`}</Text>
          </TouchableOpacity>
      </View>
  );
}

