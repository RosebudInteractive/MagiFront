import React from 'react'
import PropTypes from 'prop-types'
import Webix from '../components/Webix';

export default class EpisodeTocForm extends React.Component {
    _save(value) {
        value.Id = this.props.data.Id;
        this.props.save(value)
    }

    render() {
        const {data, cancel} = this.props;
        return <div className="dlg">
            <div className="dlg-bg">
            </div>
            <div className="dlg-window">
                <Webix ui={::this.getUI(::this._save, cancel)} data={data}/>
            </div>
        </div>
    }

    getUI(save, cancel) {
        return {
            view: "form", width: 400, elements: [
                {
                    view: "text",
                    labelPosition: "top",
                    name: "Topic",
                    label: "Название",
                    placeholder: "Введите название",
                },
                {
                    view: "counter",
                    labelPosition: "top",
                    name: "StartTime",
                    label: "Метка времени",
                    // placeholder: "",
                    autowidth: true,
                    width : 500,
                    inputWidth : 500,
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

EpisodeTocForm.propTypes = {
    data: PropTypes.object.isRequired,
    save: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
};