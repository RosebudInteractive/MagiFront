import React  from 'react'

export default class UserConfirmation extends React.Component {

    constructor(props) {
        super(props)
        this.yes = this.yes.bind(this)
        this.no = this.no.bind(this)

        this.state = {
            hidden: false
        }
    }

    yes() {
        this.props.callback(true)
        this.setState({ hidden: true })
    }

    no() {
        this.props.callback(false)
        this.setState({ hidden: true })
    }

    componentWillReceiveProps() {
        this.setState({ hidden: false })
    }

    render() {
        if (this.state.hidden) {
            return null
        }
        return (
            <div className='holder'>
                <div className='popup'>
                    <div className="dlg-message">{this.props.message}</div>
                    <div className="dlg-btn-bar">
                        <button className="btn yes" onClick={::this.yes}>Да</button>
                        <button className="btn no" onClick={::this.no}>Нет</button>
                    </div>
                </div>
            </div>
        )
    }
}