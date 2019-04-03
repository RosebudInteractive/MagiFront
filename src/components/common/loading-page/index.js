import React from 'react'
import "./loading-page.sass"

export default class LoadingPage extends React.Component {
    render() {
        return [
            <p className="loading-title">Загрузка...</p>,
            <div className="preload-icon"/>
        ]
    }
}