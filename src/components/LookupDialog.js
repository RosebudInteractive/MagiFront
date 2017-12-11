import React, { Component } from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
// import * as commonDlgActions from '../actions/CommonDlgActions';

export default class LookupDialog extends Component {
    constructor(props) {
        super(props);
        this.id = null;
    }


    yesClicked() {
        const { yesAction,} = this.props;
        yesAction(this.id);
    }

    noClicked() {
        const { noAction, } = this.props;
        noAction();
    }

    selectValue(id) {
        this.id = id;
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
                {id: 'value', header: this.props.message, fillspace: true},
            ],
            on: {
                onAfterSelect: (selObj) => {
                    this.selectValue(selObj.id);
                }
            }
        };
    }
}

LookupDialog.propTypes = {
    message: PropTypes.string.isRequired,
    yesAction: PropTypes.func.isRequired,
    noAction: PropTypes.func.isRequired,
    data: PropTypes.any
};

