import styles from "../../styles";
import React, {useState} from "react";
import {
    View,
    Text,
    Switch
} from 'react-native'

type Props = {
    toggleRising: Function,
}

export default function RiseUpOverXAxis(props: Props) {

    const [rised, setRised] = useState<boolean>(false);

    const switchRising = (value: boolean) => {
        setRised(value);
        if(props.toggleRising){
            props.toggleRising(value)
        }
    };

    return <View style={styles.controlContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap'}}>
            <Text>Поднять периоды над осью X </Text>
            <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                ios_backgroundColor="#3e3e3e"
                onValueChange={switchRising}
                value={rised}
            />
        </View>
    </View>
}
