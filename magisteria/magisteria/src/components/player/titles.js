import React from 'react';
import {connect} from 'react-redux';

class Titles extends React.Component {

    render() {
        const {subTitle} = this.props

        let _onlyTitle = !subTitle || (subTitle === '')

        return (
            <div className="player-frame__poster-text">
                <span className={"player-frame__poster-title" + (_onlyTitle ? ' single' : '')}>{this.props.title}</span>
                {
                    subTitle &&
                    <p>
                        <span className="player-frame__poster-subtitle">{subTitle}</span>
                    </p>
                }
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        paused: state.player.paused,
        title: state.player.title,
        subTitle: state.player.subTitle,
    }
}

export default connect(mapStateToProps)(Titles);