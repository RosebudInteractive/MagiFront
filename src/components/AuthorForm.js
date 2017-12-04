import React  from 'react'
import PropTypes from 'prop-types'
import Webix from '../components/Webix';

export default class EpisodeForm extends React.Component {
    render() {
        const { episode, save, cancel } = this.props
        return <div className="dlg">
            <div className="dlg-bg">
            </div>
            <div className="dlg-window">
                <Webix ui={::this.getUI(save, cancel)} data={episode} />
            </div>
        </div>
    }

    getUI(save, cancel) {
        return {
            view:"form", width:400, elements:[
                { view:"text", name:"code", label:"Идентификатор", placeholder:"Введите идентификатор"},
                { view:"text", name:"name", label:"Описание", placeholder:"Введите описание"},
                { view:"checkbox", name:"active", label:"Опубликован"},
                { cols:[
                    {},
                    {
                        view:"button", value:"ОК", click:function(){
                        if (save)
                            save(this.getFormView().getValues());
                    }
                    },
                    {
                        view:"button", value:"Отмена", click:function(){
                        if (cancel)
                            cancel();
                    }
                    }
                ]}
            ]
        }
    }
}

EpisodeForm.propTypes = {
    episode: PropTypes.object,
    save: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
};