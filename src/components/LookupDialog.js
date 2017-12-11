import React, { Component } from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
// import * as commonDlgActions from '../actions/CommonDlgActions';

export default class YesNoDialog extends Component {
    yesClicked() {
        const { yesAction, data } = this.props;
        yesAction(data);
    }

    noClicked() {
        const { noAction, data } = this.props;
        noAction(data);
    }

    render ()
    {
        const { data } = this.props;
        return <div className="dlg">
            <div className="dlg-bg">
            </div>
            <div className="dlg-window">
                {/*<div className="dlg-message">{message}</div>*/}
                <Webix ui={::this.getUI()} data={data} />
                <div className="dlg-btn-bar">
                    <button className="btn yes" onClick={::this.yesClicked}>Да</button>
                    <button className="btn no" onClick={::this.noClicked}>Нет</button>
                </div>
            </div>
        </div>
    }

    getUI() {
        return {
            view: "datatable",
            scroll: false,
            autoheight: true,
            select: true,
            editable: false,
            columns: [
                {id: 'Value', header: 'Значение', fillspace: true},
                // {id: "active", header: "", width: 50, template: "{common.checkbox()}", readOnly: true},
                // {id: "created", header: "Создан", width: 150, format: this.formatDate},
                // {id: "updated", header: "Обновлен", width: 150, format: this.formatDate}
            ],
            // on: {
            //     onAfterSelect: function (selObj) {
            //         select(selObj.id);
            //     }
            // }
        };
    }
}

YesNoDialog.propTypes = {
    message: PropTypes.string.isRequired,
    yesAction: PropTypes.func.isRequired,
    noAction: PropTypes.func.isRequired,
    data: PropTypes.any
}

// export default class ErrorDialog extends Component {
//
//     constructor(props) {
//         super(props)
//         const {
//             onSave,
//             onCancel,
//             data
//         } = this.props;
//     }
//
//     okClicked() {
//         if (this.onSave) {
//
//         }
//
//         this.props.commonDlgActions.confirmError();
//     }
//
//     render () {
//         const { message } = this.props;
//         return <div className="dlg">
//             <div className="dlg-bg">
//             </div>
//             <div className="dlg-window">
//                 <div className="dlg-message">{message}</div>
//                 <div className="dlg-btn-bar">
//                     <button className="btn yes" onClick={::this.okClicked}>Ok</button>
//                 </div>
//             </div>
//         </div>
//     }
//
//     getUI(select) {
//         return {
//             view: "datatable",
//             scroll: false,
//             autoheight: true,
//             select: true,
//             editable: false,
//             columns: [
//                 {id: 'FirstName', header: 'Имя', width: 200},
//                 {id: 'LastName', header: 'Фамилия', width: 300},
//                 {id: "Description", header: "Описание", fillspace: true},
//                 // {id: "active", header: "", width: 50, template: "{common.checkbox()}", readOnly: true},
//                 // {id: "created", header: "Создан", width: 150, format: this.formatDate},
//                 // {id: "updated", header: "Обновлен", width: 150, format: this.formatDate}
//             ],
//             on: {
//                 onAfterSelect: function (selObj) {
//                     select(selObj.id);
//                 }
//             }
//         };
//     }
// }
//
// ErrorDialog.propTypes = {
//     message: PropTypes.string.isRequired,
//     data: PropTypes.any
// };

// function mapDispatchToProps(dispatch) {
//     return {
//         commonDlgActions : bindActionCreators(commonDlgActions, dispatch),
//     }
// }
//
// export default connect(null, mapDispatchToProps)(ErrorDialog);
