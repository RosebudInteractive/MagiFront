import React from 'react'
import "./loading-page.sass"
import Preloader from './preloader'

export default class LoadingPage extends React.Component {
    render() {
        return <React.Fragment>
            <p className="loading-title">Загрузка...</p>
            <Preloader/>
        </React.Fragment>

    }
}
