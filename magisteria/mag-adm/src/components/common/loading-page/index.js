import React from 'react'
import "./loading-page.sass"
import Preloader from './preloader'

export default class LoadingPage extends React.Component {
    render() {
        return [
            <p className="loading-title">Загрузка...</p>,
            <Preloader/>
        ]
    }
}
