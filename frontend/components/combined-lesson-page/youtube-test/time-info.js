import React from 'react';
// import {connect} from 'react-redux';

import * as tools from '../../../tools/time-tools'
import PropTypes from "prop-types";

export default class TimeInfo extends React.Component {

    static propTypes = {
        currentTime: PropTypes.number,
        totalDuration: PropTypes.number,
    }

    render() {
        let _playTimeFrm = tools.getTimeFmt(this.props.currentTime),
            _totalDurationFmt = tools.getTimeFmt(this.props.totalDuration)

        return (
            <div className="player-block__info">
                <span className="played-time">{_playTimeFrm}</span>
                <span className="divider">/</span>
                <span className="total-time">{_totalDurationFmt}</span>
            </div>
        )

    }
}

// function mapStateToProps(state) {
//     return {
//         currentTime: state.player.currentTime,
//         totalDurationFmt: state.player.totalDurationFmt,
//     }
// }
//
// export default connect(mapStateToProps)(TimeInfo);