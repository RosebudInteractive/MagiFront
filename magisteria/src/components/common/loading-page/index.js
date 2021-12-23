import React from 'react'
import "./loading-page.sass"
import "./preloader.gif"
import Preloader from './preloader'

export default class LoadingPage extends React.Component {
    render() {
        return [
            <p className="loading-title">Загрузка...</p>,
            <Preloader/>
        ]
    }
}