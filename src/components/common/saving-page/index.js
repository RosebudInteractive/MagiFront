import React from 'react'
import PropTypes from 'prop-types';
import Preloader from "../loading-page/preloader";
import './saving-page.sass'

export default class SavingPage extends React.PureComponent {

    static propTypes = {
        visible: PropTypes.bool
    }

    render() {
        return this.props.visible ?
            <div className="dialog saving-dialog">
                <div className="dialog-bg"/>
                <p className="saving-title">Идет сохранение...</p>,
                <Preloader/>
            </div>
            :
            null
    }
}