import React from 'react'
import './loading-page.sass'

export default function Preloader() {
    const _style = {width: "100%", height: "100%"}

    return <div className="lds-css ng-scope preloader-wrapper">
        <div className="lds-spinner" style={_style}>
            <div key={1}/>
            <div key={2}/>
            <div key={3}/>
            <div key={4}/>
            <div key={5}/>
            <div key={6}/>
            <div key={7}/>
            <div key={8}/>
            <div key={9}/>
            <div key={10}/>
            <div key={11}/>
            <div key={12}/>
        </div>
    </div>
}
