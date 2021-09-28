import React from 'react';
import { View, Text, } from 'react-native';
import SerifsContext from '../../serifs/context';
import styles from './styles';
class SerifItem extends React.Component {
    textRef;
    constructor(props) {
        super(props);
        this.textRef = React.createRef();
        this.state = {
            textOffset: 0,
            visible: true,
        };
    }
    onLayout(data) {
        const { rightBound } = this.props;
        const { x, width } = data;
        if ((x <= 0) || ((x + width) >= rightBound)) {
            this.setState({ visible: false });
        }
        else {
            this.setState({ textOffset: data.width / 2 });
        }
    }
    render() {
        const { x, zoom } = this.context;
        const { index, year, yearPerPixel } = this.props;
        const left = x * index + (year < 0 ? yearPerPixel * zoom : 0);
        const { textOffset, visible } = this.state;
        const serifStyle = { left };
        const textStyle = {
            left: left - textOffset,
        };
        return visible && (<React.Fragment>
            <View style={[styles.serif, serifStyle]}/>
            <Text style={[styles.text, textStyle]} ref={this.textRef} onLayout={(event) => {
                this.onLayout(event.nativeEvent.layout);
            }}>
                {year === 0 ? -1 : year}
            </Text>
        </React.Fragment>);
    }
}
SerifItem.contextType = SerifsContext;
export default SerifItem;
