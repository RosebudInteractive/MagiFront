import React from "react"
import "./result-form.sass"

const GLASSES = '<use xlink:href="#glasses"/>'

export default class SearchEmpty extends React.Component {

    render() {
        return <div className="search-result__empty-block">
                <div className="empty-block__glasses">
                    <svg width="70" height="48" dangerouslySetInnerHTML={{__html: GLASSES}}/>
                </div>
                <div className="font-universal__body-large empty-block__title">По вашему запросу ничего не найдено</div>
                <div className="font-universal__body-medium empty-block__subtitle">Уточните запрос или поищите по другим ключевым словам</div>
            </div>
    }
}


