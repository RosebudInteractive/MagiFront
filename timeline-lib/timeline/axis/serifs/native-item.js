import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SerifsContext} from '../../serifs/context';

type Props = {
    x: number,
    index: number,
    text: string
}

class SerifItem extends React.Component {
    constructor(props: Props) {
        super(props);
        this.textRef = React.createRef()
        this.state = {
            textOffset: 0
        }
    }

    onLayout(data) {
        this.setState({textOffset: data.width / 2})
    }

    render() {
        const {x,} = this.context

        const {index, text} = this.props;

        const serifStyle = {
            left: x * index,
        }

        const textStyle = {
            left: x * index - this.state.textOffset,
        };

        return <React.Fragment>
            <View style={[styles.serif, serifStyle]}/>
            <Text style={[styles.text, textStyle]} ref={this.textRef} onLayout={(event) => {
                this.onLayout(event.nativeEvent.layout)
            }}>
                {text}
            </Text>
        </React.Fragment>
    }
}

SerifItem.contextType = SerifsContext

export default SerifItem

const styles = StyleSheet.create({
    serif: {
        position: "absolute",
        backgroundColor: "rgb(255, 255, 255)",
        top: 0,
        width: 2,
        height: 6,
    },
    text: {
        position: "absolute",
        color: "rgb(255, 255, 255)",
        top: 12,
        fontFamily: "Fira Sans",
        fontSize: 12,
        fontWeight: '400'
    }
})
