import React, {useEffect, useState} from "react";
import './menu-options.sass'
import {usePointerPosition} from "../../../../tools/use-pointer-position";


export default function MenuOptions({isOn, coords, optionsArray = [], selectedRecord}) {
    const [active, setActive] = useState(isOn);

    const position = usePointerPosition();

    useEffect(() => {
        // console.log('isOn', isOn)
        // console.log('coords', coords)
    }, [coords]);

    useEffect(() => {
        // console.log(position);
    }, [position]);




    return (
        <div className={`menu-options ${active  ? 'active' : 'disabled'}`} style={{top: position.y, left: position.x}} >
            {
                optionsArray.map(option => {
                    return <div className='menu-option' onClick={() => {
                        console.log('option!');
                        option.action(selectedRecord);
                        setActive(false); //default behavior - close menu when some action triggered
                    }}>
                        {option.title}
                    </div>
                })
            }
        </div>
    )
}
