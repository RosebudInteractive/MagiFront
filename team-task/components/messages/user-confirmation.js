import React, {useEffect, useState} from 'react'
import {render} from "react-dom";
import './dialog.sass'
import {bindActionCreators} from "redux";
import {CONFIRMATION, showUserConfirmation, toggleMessage} from "tt-ducks/messages";
import {connect} from "react-redux";

export const getConfirmation = (message, callback) => {
    render((
        <UserConfirmation message={message} callback={callback}/>
    ), document.getElementById('confirm'));
};

const UserConfirmation = (props) => {
    const [hidden, setHidden] = useState(false);

    const yes = () => {
        props.callback(true)
    };

    const no = (e) => {
        props.callback(false);
        setHidden(true);
        e.preventDefault();
    };

    useEffect(() => {
        setHidden(true);
        props.actions.showUserConfirmation({type: CONFIRMATION, content: props.message})
    }, [props]);

    return (
        hidden ?
            null
            :
            <div className='holder'>
                <div className='dialog'>
                    <div className="dialog-bg"/>
                    <div className="dialog-window">
                        <div className="dialog-message">{props.message}</div>
                        <div className="dialog-btn-bar">
                            <button className="btn" onClick={yes}>Да</button>
                            <button className="btn no" onClick={no} autoFocus={true}>Нет</button>
                        </div>
                    </div>
                </div>
            </div>
    )
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            showUserConfirmation,
            toggleMessage
        }, dispatch)
    }
};

export default connect(mapDispatch2Props)(UserConfirmation)


//CLASS EQUIVALENT
// class UserConfirmation extends React.Component {
//
//     constructor(props) {
//         super(props)
//         this.yes = this.yes.bind(this)
//         this.no = this.no.bind(this)
//
//         this.state = {
//             hidden: false
//         }
//     }
//
//     yes() {
//         this.props.callback(true);
//         this.setState({hidden: true});
//     }
//
//     no(e) {
//         this.props.callback(false);
//         this.setState({hidden: true});
//         e.preventDefault();
//     }
//
//     UNSAFE_componentWillReceiveProps() {
//         this.setState({hidden: false})
//     }
//
//     render() {
//         return this.state.hidden ?
//             null
//             :
//             <div className='holder'>
//                 <div className='dialog'>
//                     <div className="dialog-bg"/>
//                     <div className="dialog-window">
//                         <div className="dialog-message">{this.props.message}</div>
//                         <div className="dialog-btn-bar">
//                             <button className="btn" onClick={::this.yes}>Да</button>
//                             <button className="btn no" onClick={::this.no} autoFocus={true}>Нет</button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//     }
// }
