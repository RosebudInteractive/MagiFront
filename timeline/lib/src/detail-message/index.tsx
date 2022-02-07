import React, { useMemo, useState } from 'react';
import {
  GestureResponderEvent, Text, TouchableOpacity, View, ViewStyle, 
} from 'react-native';
import styles from './styles';
import { VisualItem } from '../types/common';
import CloseButton from './close-button';
import References from './references';
import SETTINGS from '../timeline/settings';
import { References as ReferencesType } from '../types/references';

type Props = {
  item: VisualItem,
  indent: number,
  onClose: (event: GestureResponderEvent) => void,
  onCenter: (event: GestureResponderEvent) => void,
  pinned?: boolean,
  references: ReferencesType,
};

// eslint-disable-next-line react/function-component-definition
export default function Message(props: Props): JSX.Element {
  const {
    item, onClose, onCenter, indent, pinned, references
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

  const [visibleReferences, setVisibleReferences] = useState( false );

  const onShowReferences = (event: GestureResponderEvent) => {
    if (item.references && item.references.length){
      setVisibleReferences(!visibleReferences);
    }
  };

  const countValidRefs = useMemo<number>( ()=>{
    return (item.references||[]).length;
    },[item, references]
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
      </TouchableOpacity>
      <View style={styles.details}>
        <View style={[styles.description,{marginBottom: 6}]}>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        {(item.references)?
          <View style={styles.references}>
            {(visibleReferences)?
              <References item ={item} references={references} onPressClose={onShowReferences}/>:
              <TouchableOpacity onPress={onShowReferences}>
                <Text style={styles.references}>{`Показать упоминания (${countValidRefs})`}</Text>
              </TouchableOpacity>
            }
          </View>:null}
      </View>
    </View>
  );
}

Message.defaultProps = {
  pinned: false
};
