import styles from "../../styles";
import React, {useState} from "react";
import {
    View,
    Text,
    Switch
} from 'react-native'

type Props = {
    switchVisibilityChecking: Function,
}

export default function CheckVisibilitySwitcher(props: Props): JSX.Element {
    const [visibilityChecking, setVisibilityChecking] = useState<boolean>(true);

    const switchVisibilityChecking = (value: boolean) => {
        setVisibilityChecking(value);
        if(props.switchVisibilityChecking){
            props.switchVisibilityChecking(value)
        }
    };

    return <View style={styles.controlContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
            <Text>Учитывать видимость при воспроизведении </Text>
            <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                ios_backgroundColor="#3e3e3e"
                onValueChange={switchVisibilityChecking}
                value={visibilityChecking}
            />
        </View>
    </View>
}
