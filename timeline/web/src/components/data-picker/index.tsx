import React, {useState, useEffect,} from 'react';
import {
    View, Picker, Text,
} from 'react-native';
import EVENTS from '../../data/events';
import appStyles from '../../styles';
import styles from './styles';

type Props = {
    onChange?: Function,
}

export default function DataPicker(props: Props): JSX.Element | null {
    const [selectedValue, setSelectedValue] = useState('');

    const onChange = (itemValue: string) => {
        setSelectedValue(itemValue);
        if (props.onChange) {
            props.onChange(+itemValue);
        }
    };

    useEffect(() => {
        if (EVENTS.length) {
            onChange('0');
        }
    }, []);

    return (
        EVENTS.length
            ?
            <View style={styles.container}>
                <Text style={[appStyles.buttonsTitle, styles.text]}>
                    Набор событий
                </Text>
                <Picker
                    selectedValue={selectedValue}
                    style={styles.picker}
                    onValueChange={onChange}
                >
                    {EVENTS.map((item, index) => <Picker.Item label={item.label} value={index.toString()} key={index}/>)}
                </Picker>
            </View>
            :
            null
    )

}
