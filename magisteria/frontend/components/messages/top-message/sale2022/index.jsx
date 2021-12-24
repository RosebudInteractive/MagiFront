import React from 'react';
import "./sale2022.sass";
import Left from './left.png';
import Center from './center.png';
import Right from './right.png';
export default function Sale2021(props) {
    const { config, confirmed, onClose } = props;
    const closed = !config.visible || (config.visible && confirmed);
    if (closed)
        return null;
    return <div className="top-message__sale2022-popup">
        <img className="sale2022-popup__image _left" src={Left} alt={'santa'}/>
        <img className="sale2022-popup__image _center" src={Center} alt={'2022'}/>
        <img className="sale2022-popup__image _right" src={Right} alt={'christmas'}/>
        <div className="sale2022-popup__close-button">
            <button type="button" className="balloon-wrapper__close" onClick={onClose}>Закрыть</button>
        </div>
    </div>;
}
