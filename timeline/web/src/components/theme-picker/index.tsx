import React, {useState, useEffect} from 'react';
import {
    View, Picker, Text,
} from 'react-native';
import {Themes} from '@rosebud/timeline/src';
import appStyles from '../../styles';
import styles from './styles';

type Props = {
    onChange?: Function,
}

export default function ThemePicker(props: Props): JSX.Element | null {
    const [selectedValue, setSelectedValue] = useState<string>();

    const onChange = (itemValue: string) => {
        setSelectedValue(itemValue);
        if (props.onChange) {
            props.onChange(+itemValue);
        }
    };

    useEffect(() => {
        if (Themes.themes.length) {
            onChange('0');
        }
    }, []);

    return Themes.themes.length
        ? (
            <View style={styles.container}>
                <Text style={[appStyles.buttonsTitle, styles.text]}>
                    Тема
                </Text>
                <Picker
                    selectedValue={selectedValue}
                    style={styles.picker}
                    onValueChange={onChange}
                >
                    {Themes.themes.map((item, index) => <Picker.Item label={item.title} value={index.toString()}
                                                                     key={index}/>)}
                </Picker>
            </View>
        )
        : null
}
