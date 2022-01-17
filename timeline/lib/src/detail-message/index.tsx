import React, { useMemo } from 'react';
import {
  GestureResponderEvent, Text, TouchableOpacity, View, ViewStyle,
} from 'react-native';
import styles from './styles';
import { VisualItem } from '../types/common';
import CloseButton from './close-button';
import SETTINGS from '../timeline/settings';

type Props = {
  item: VisualItem,
  indent: number,
  onClose: (event: GestureResponderEvent) => void,
  onCenter: (event: GestureResponderEvent) => void,
  pinned?: boolean,
};

// eslint-disable-next-line react/function-component-definition
export default function Message(props: Props): JSX.Element {
  const {
    item, onClose, onCenter, indent, pinned,
  } = props;

  const wrapperStyle = useMemo<ViewStyle>(
    () => {
      const { width, minWidth, maxWidth } = SETTINGS.message;
      return pinned
        ? {
          width: '100%',
          top: 0,
          left: 0,
        }
        : {
          width,
          minWidth,
          maxWidth,
          top: 14 + indent,
        };
    },
    [indent, pinned],
  );

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <TouchableOpacity onPress={onCenter}>
      <View style={[styles.header, { backgroundColor: item.color }]}>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={3}>{item.name}</Text>
          <Text style={styles.date}>{item.displayDate}</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <View
            style={styles.button}
          >
            <CloseButton />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.details}>
        <View style={styles.description}>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
      </TouchableOpacity>
    </View>
  );
}

Message.defaultProps = {
  pinned: false,
};
