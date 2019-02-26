import React from 'react';
import PropTypes from 'prop-types';
import './controls.sass'

export default class SelectControl extends React.Component {

    static propTypes = {
        cover: PropTypes.string,
    };

    render() {
        const {input, meta: {error, visited}, id, label, disabled, hidden} = this.props;

        return <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
            <label htmlFor={id} className="field-label">{label}</label>
            <div className={"field-wrapper__editor-wrapper"}>
                <img className="cover-wrapper" src={input.value}/>
            </div>
        </div>
    }
}