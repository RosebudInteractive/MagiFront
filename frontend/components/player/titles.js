import React from 'react';
import {connect} from 'react-redux';

class Titles extends React.Component {

    render() {
        // return !this.props.paused ?
        return (
            <div className="player-frame__poster-text">
                <span className="player-frame__poster-title">{this.props.title}</span>
                <p>
                    <span className="player-frame__poster-subtitle">{this.props.subTitle}</span>
                </p>
            </div>
        )
        // :
        // null

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