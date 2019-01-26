import React from 'react'
import {render} from "react-dom";
import './dialog.sass'

export const getConfirmation = (message, callback) => {
    render((
        <UserConfirmation message={message} callback={callback}/>
    ), document.getElementById('confirm'));
};

class UserConfirmation extends React.Component {

    constructor(props) {
        super(props)
        this.yes = this.yes.bind(this)
        this.no = this.no.bind(this)

        this.state = {
            hidden: false
        }
    }

    yes() {
        this.props.callback(true);
        this.setState({hidden: true});
    }

    no(e) {
        this.props.callback(false);
        this.setState({hidden: true});
        e.preventDefault();
    }

    componentWillReceiveProps() {
        this.setState({hidden: false})
    }

    render() {
        return this.state.hidden ?
            null
            :
            <div className='holder'>
                <div className='dialog'>
                    <div className="dialog-bg"/>
                    <div className="dialog-window">
                        <div className="dialog-message">{this.props.message}</div>
                        <div className="dialog-btn-bar">
                            <button className="btn" onClick={::this.yes}>Да</button>
                            <button className="btn no" onClick={::this.no} autoFocus={true}>Нет</button>
                        </div>
                    </div>
                </div>
            </div>
    }
}