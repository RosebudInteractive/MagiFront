import React from 'react'
import PropTypes from 'prop-types';
import Preloader from "../loading-page/preloader";
import './saving-page.sass'

export default class SavingPage extends React.PureComponent {

    static propTypes = {
        visible: PropTypes.bool,
        title: PropTypes.string,
    }

    static defaultProps = {
        title: "Идет сохранение..."
    }

    render() {
        return this.props.visible ?
            <div className="dialog saving-dialog">
                <div className="dialog-bg"/>
                <p className="saving-title">{this.props.title}</p>,
                <Preloader/>
            </div>
            :
            null
    }
}