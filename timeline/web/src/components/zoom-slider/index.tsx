import React from "react";
import {View, StyleSheet, Text, ViewStyle, TextStyle} from "react-native";
import appStyles from "../../styles";

type Props = {
    value: number,
    onChange: Function,
    onSliderStop: Function
}

export default function ZoomSlider(props: Props): JSX.Element {

    const {value} = props

    const onChangeValue = (e: React.FormEvent<HTMLInputElement>) => {
        props.onChange(+e.currentTarget.value / 100)
    }

    return <View style={styles.containerLeft}>
        <Text style={[appStyles.buttonsTitle, styles.text]}>
            {`Текущий зум : ${value}`}
        </Text>
            <input style={{maxWidth: 500, width: "100%"}}
               onMouseUp={() => props.onSliderStop(true)}
               onMouseDown={() => props.onSliderStop(false)}
               type="range" min={100} max={1000}
               value={value * 100}
               className="slider"
               id="myRange"
               onChange={onChangeValue}/>
    </View>

}

declare type Styles = {
    container: ViewStyle,
    containerLeft: ViewStyle,
    text: TextStyle,
}


const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        flexDirection: "column",
        width: "100%",
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    containerLeft: {
        flex: 1,
        flexDirection: "column",
        width: "50%",
        backgroundColor: '#fff',
        justifyContent: 'flex-start',
        // @ts-ignore
        alignSelf: 'start',
        minWidth: 250,
    },
    text: {
        // @ts-ignore
        textAlign: 'Left',
        marginRight: 20,
    },
    slider: {
        maxWidth: 300,
        width: "50%"
    },
})
