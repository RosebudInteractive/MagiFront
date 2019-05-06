import React from "react"
import PropTypes from "prop-types"
import WaitingFrame from "./billing/waiting-frame";
import $ from "jquery";
import Platform from "platform";

export default class ModalWaiting extends React.Component {

    static propTypes = {
        visible: PropTypes.bool,
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.visible && nextProps.visible) {
            $('body').addClass('modal-open')
        }

        if (this.props.visible && !nextProps.visible) {
            $('body').removeClass('modal-open')
        }
    }

    render() {
        const _isIE = Platform.name === 'IE',
            _className ="modal-overlay modal-wrapper waiting-form" +
            (_isIE ? ' ms-based' : '')

        return this.props.visible ?
            <div className={_className}>
                <WaitingFrame visible={true} message={"Идет выполнение операции. Пожалуйста, подождите..."}/>
            </div>
            :
            null
    }

}