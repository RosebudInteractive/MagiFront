import React from 'react'
import "./loading-page.sass"
import "./preloader.gif"

export default class LoadingPage extends React.Component {
    render() {
        return [
            <p className="loading-title">Загрузка...</p>,
            <div className="preload-icon"/>
        ]
    }
}