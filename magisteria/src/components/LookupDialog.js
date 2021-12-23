import React, {Component} from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';

export default class LookupDialog extends Component {
    constructor(props) {
        super(props);
        this.id = null;
    }


    yesClicked() {
        const {yesAction,} = this.props;
        yesAction(this.id);
    }

    noClicked() {
        const {noAction,} = this.props;
        noAction();
    }

    selectValue(id) {
        this.id = id;
    }


    render() {
        const {data, message} = this.props;
        return <div className="dlg">
            <div className="dlg-bg">
            </div>
            <div className="dlg-window">
                <div className="dlg_message lookup_header lookup_header_blue">{message}</div>
                <div id='grid_container' className='grid_container'/>
                <Webix ui={::this.getUI()} data={data}/>
                <div className="dlg-btn-bar">
                    <button className="btn yes" onClick={::this.yesClicked}>Да</button>
                    <button className="btn no" onClick={::this.noClicked}>Нет</button>
                </div>
            </div>
        </div>
    }

    getUI() {
        let that = this;

        return {
            view: "datatable",
            scroll: false,
            container: 'grid_container',
            header: false,
            scrollY: true,
            autoheight: true,
            select: true,
            editable: false,
            columns: [
                {id: 'value', fillspace: true},
            ],
            on: {
                onAfterSelect: (selObj) => {
                    this.selectValue(selObj.id);
                },
                onItemDblClick: function (id) {
                    if (id && this.getItem(id.row)) {
                        that.selectValue(this.getItem(id.row).id);
                        that.yesClicked()

                    }
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

