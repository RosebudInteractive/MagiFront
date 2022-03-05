import React from 'react';
import {connect} from 'react-redux';

import * as tools from '../../tools/time-tools'

class TimeInfo extends React.Component {

    render() {
        let _playTimeFrm = tools.getTimeFmt(this.props.currentTime)

        return (
            <div className="player-block__info">
                <span className="played-time">{_playTimeFrm}</span>
                <span className="divider">/</span>
                <span className="total-time">{this.props.totalDurationFmt}</span>
            </div>
        )

    }
}

function mapStateToProps(state) {
    return {
        currentTime: state.player.currentTime,
        totalDurationFmt: state.player.totalDurationFmt,
    }
}

export default connect(mapStateToProps)(TimeInfo);