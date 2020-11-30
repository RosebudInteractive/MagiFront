import React from 'react';
import PropTypes from 'prop-types';
import "./title.sass"

export default function Titles(props) {

    const {title, subTitle} = props

    let _onlyTitle = !subTitle || (subTitle === '')

    return <div className="player-frame__poster-text">
        <span className={"player-frame__poster-title _white" + (_onlyTitle ? ' single' : '')}>{title}</span>
        {
            subTitle &&
            <p>
                <span className="player-frame__poster-subtitle _white-secondary">{subTitle}</span>
            </p>
        }
    </div>
}

Titles.propTypes = {
    title: PropTypes.string,
    subTitle: PropTypes.string,
}