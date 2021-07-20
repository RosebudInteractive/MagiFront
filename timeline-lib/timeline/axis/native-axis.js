import React, {useMemo} from "react"
import {StyleSheet, View} from 'react-native';
import Serifs from './serifs';

type Props = {
    width: number,
    top: number,
    serifs: any
}

export default function Axis(props: Props) {
    const {width, top, serifs} = props

    const _style = useMemo(() => {
        return {
            width: width,
            top: top,
        }
    }, [width, top])

    return <View style={[styles.wrapper, _style]}>
        <Serifs points={serifs} y={top}/>
    </View>
}

const styles = StyleSheet.create({
    wrapper: {
        borderTopColor: "rgb(255, 255, 255)",
        borderTopWidth: 2
    }
})
