import React  from 'react'
import PropTypes from 'prop-types'
import Webix from '../components/Webix';

export default class AuthorForm extends React.Component {
    render() {
        const { author, save, cancel } = this.props;
        return <div className="dlg">
            <div className="dlg-bg">
            </div>
            <div className="dlg-window">
                <Webix ui={::this.getUI(save, cancel)} data={author} />
            </div>
        </div>
    }

    getUI(save, cancel) {
        return {
            view:"form", width:400, elements:[
                // { view:"text", name:"AuthorId", label:"Идентификатор", placeholder:"Введите идентификатор"},
                { view:"text", name:"AccountId", label:"Аккаунт", placeholder:"Введите аккаунт"},
                { view:"text", name:"LanguageId", label:"Язык", placeholder:"Введите язык"},
                { view:"text", name:"FirstName", label:"Имя", placeholder:"Введите имя"},
                { view:"text", name:"LastName", label:"Фамилия", placeholder:"Введите фамилию"},
                { view:"text", name:"Description", label:"Описание", placeholder:"Описание"},
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

AuthorForm.propTypes = {
    author: PropTypes.object,
    save: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
};