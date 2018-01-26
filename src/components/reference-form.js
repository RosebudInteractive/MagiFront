import React from 'react'
import PropTypes from 'prop-types'
import Webix from '../components/Webix';

export default class ReferenceForm extends React.Component {
    _save(value) {
        value.Recommended = this.props.data.Recommended;
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
                    view: "textarea",
                    labelPosition: "top",
                    height: 300,
                    name: "Description",
                    label: "Описание",
                    placeholder: "Введите описание"
                },
                {
                    view: "text",
                    labelPosition: "top",
                    name: "URL",
                    label: "Ссылка на источник",
                    placeholder: "Введите URL"
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

ReferenceForm.propTypes = {
    data: PropTypes.object.isRequired,
    save: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
};