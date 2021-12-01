import React from 'react';
import { View, Text, } from 'react-native';
import SerifsContext from '../../serifs/context';
import styles from './styles';
import SETTINGS from '../../../settings';
class SerifItem extends React.Component {
    // eslint-disable-next-line react/sort-comp
    textRef;
    constructor(props) {
        super(props);
        this.textRef = React.createRef();
        this.state = {
            textOffset: 0,
            visible: true,
        };
    }
    // componentDidUpdate(prevProps: Readonly<Props>) {
    componentDidUpdate() {
        // const { rightBound } = this.props;
        const { visible } = this.state;
        // if (prevProps.rightBound !== rightBound) {
        // eslint-disable-next-line react/no-did-update-set-state
        if (!visible)
            this.setState({ visible: true });
        // }
    }
    onLayout(data) {
        // const { rightBound } = this.props;
        const { x } = data;
        // if ((x <= 0) || (x > rightBound)) {
        if (x <= 0) {
            this.setState({ visible: false });
        }
        else {
            this.setState({ textOffset: data.width / 2 });
        }
    }
    render() {
        const { zoom, needCorrectionOnBC } = this.context;
        const { year, yearPerPixel, startDate, } = this.props;
        const needCorrect = needCorrectionOnBC && (year > 0);
        const correctedYear = needCorrect ? year - 1 : year;
        const left = (correctedYear - startDate) * yearPerPixel * zoom;
        const { textOffset, visible } = this.state;
        const serifStyle = { left: left + SETTINGS.horizontalPadding };
        const textStyle = {
            left: left - textOffset + SETTINGS.horizontalPadding,
        };
        return visible && (<React.Fragment>
        <View style={[styles.serif, serifStyle]}/>
        <Text style={[styles.text, textStyle]} ref={this.textRef} onLayout={(event) => {
                this.onLayout(event.nativeEvent.layout);
            }}>
          {year === 0 ? 1 : year}
        </Text>
      </React.Fragment>);
    }
}
SerifItem.contextType = SerifsContext;
export default SerifItem;
