import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import * as playerStartActions from '../../actions/player-start-actions'

class RateTooltip extends Component {

    constructor(props) {
        super(props)
    }

    static propTypes = {
        visible: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        visible: false,
    };

    _getRates() {
        let that = this;
        const _rates = [
            {value: 0.25}, // Todo : надо убрать 0.25
            {value: 0.5},
            {value: 0.75},
            {value: 1.0, title: 'Обычная'},
            {value: 1.25},
            {value: 1.5},
            {value: 2},
        ];

        return _rates.map((item, index) => {
            return <li className={(this.props.rate === item.value) ? 'active' : ''} key={index}
                       onClick={() => that._setRate(item.value)}>
                {item.title ? item.title : item.value}
            </li>
        })
    }

    _setRate(value) {
        this.props.playerStartActions.startSetRate(value)
    }

    render() {
        return (
            <div className={"speed-tooltip js-player-tooltip js-speed opened"}>
                <header className="speed-tooltip__header">
                    <p className="speed-tooltip__title">Скорость</p>
                </header>
                <ul className="speed-tooltip__body">
                    {this._getRates()}
                </ul>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        rate: state.player.rate,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RateTooltip);