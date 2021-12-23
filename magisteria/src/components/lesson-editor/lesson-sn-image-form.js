import React from 'react'
import Webix from '../Webix';
import PropTypes from "prop-types";

export default class SnImageSelectForm extends React.Component {

    static propTypes = {
        resources: PropTypes.array,
    };

    constructor(props) {
        super(props);

    }

    _save(value) {
        this.props.save(value)
    }

    render() {
        const {
            data,
            cancel,
        } = this.props;

        return (
            <div className="dlg">
                <div className="dlg-bg">
                </div>
                <div className="dlg-window">
                    <Webix ui={::this.getUI(::this._save, cancel)} data={data}/>
                </div>
            </div>
        )
    }

    _getResourceArray() {
        return this.props.resources.map((item) => {
            let _fileId= item.FileId ? item.FileId : '',
                _name = item.Name ? item.Name : item.FileName,
                _separator = ((_fileId !== '') && (_name !== '')) ? ' : ' : '',
                _title = _fileId + _separator + _name;

            return {id: item.Id, value: _title}
        })
    }

    getUI(save, cancel) {
        return {
            view: "form", width: 400, elements: [
                {
                    view: "combo",
                    labelPosition: "top",
                    name: "Id",
                    label: "Ресурса",
                    options : this._getResourceArray(),
                    width: 400,
                },
                {
                    cols: [
                        {},
                        {
                            view: "button", value: "ОК", click: function () {
                            if (save)
                                save(this.getFormView().getValues());
                        }
                        },
                        {
                            view: "button", value: "Отмена", click: function () {
                            if (cancel)
                                cancel();
                        }
                        }
                    ]
                }
            ]
        }
    }
}
