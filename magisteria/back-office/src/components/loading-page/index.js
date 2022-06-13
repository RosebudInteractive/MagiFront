import React from 'react'
import "./loading-page.sass"
import Preloader from './preloader'

export default class LoadingPage extends React.Component {
    render() {
        return <div className={"loading-page"}>
            <div className={"loading-page__wrapper"}>
                <p className="loading-title">Загрузка...</p>
                <Preloader/>
            </div>
        </div>

    }
}
