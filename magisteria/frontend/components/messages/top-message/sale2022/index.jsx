import React, { useMemo } from 'react';
import "./sale2022.sass";
import Left from './left.png';
import Center from './center.png';
import Right from './right.png';
const STARS_COUNT = 200;
export default function Sale2021(props) {
    const { config, confirmed, onClose } = props;
    const stars = useMemo(() => {
        const count = Math.round(Math.random() * STARS_COUNT / 2 + STARS_COUNT / 2);
        const arr = Array.from(Array(count).keys());
        return arr.map(() => {
            const isSmall = Math.random() < .5;
            const onLeft = Math.random() < .5;
            const style = {
                top: Math.round(Math.random() * 100 + 20),
                transform: 'translateX(-50%)'
            };
            if (onLeft) {
                style.left = `calc(50% - ${Math.round(Math.random() * 250)}px)`;
            }
            else {
                style.left = `calc(50% + ${Math.round(Math.random() * 250)}px)`;
            }
            return <div className={`sale2022-popup__star ${isSmall ? 'small' : 'big'} ${onLeft ? 'left' : 'right'}`} style={style}/>;
        });
    }, []);
    const closed = !config.visible || (config.visible && confirmed);
    if (closed)
        return null;
    return <div className="top-message__sale2022-popup">
        <div className='sale2022-popup__wrapper'>
            <div className="sale2022-popup__image _with-background _left">
                <img className='sale2022-popup__image' src={Left} alt={'santa'}/>
            </div>
            <img className="sale2022-popup__image _center" src={Center} alt={'2022'}/>
            <div className="sale2022-popup__image _with-background _right">
                <img className='sale2022-popup__image' src={Right} alt={'christmas'}/>
            </div>
            <div className='sale2022-popup__stars-block'>
                {stars}
            </div>
        </div>
        <div className="sale2022-popup__close-button">
            <button type="button" className="balloon-wrapper__close" onClick={onClose}>Закрыть</button>
        </div>
    </div>;
}
