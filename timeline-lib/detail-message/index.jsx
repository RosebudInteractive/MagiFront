import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View, } from 'react-native';
import styles from './styles';
import CloseButton from './close-button';
import SETTINGS from '../timeline/settings';
export default function Message(props) {
    const { item, onClose, indent, pinned, } = props;
    const wrapperStyle = useMemo(() => {
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
    }, [indent, pinned]);
    return (<View style={[styles.wrapper, wrapperStyle]}>
      <View style={[styles.header, { backgroundColor: item.color }]}>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={3}>{item.name}</Text>
          <Text style={styles.date}>{item.displayDate}</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <View style={styles.button}>
            <CloseButton />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.details}>
        <View style={styles.description}>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    </View>);
}
Message.defaultProps = {
    pinned: false,
};
