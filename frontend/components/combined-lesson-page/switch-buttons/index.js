import React from 'react';
import "./switch-buttons.sass"

export default class SwitchButtons extends React.Component {

    render() {
        return <div className="lesson__switch-buttons__block">
             <div className="lesson__switch-button _to-player button _brown">К плееру</div>
             <div className="lesson__switch-button _to-text button _brown">К транскрипту</div>
            </div>
    }

}