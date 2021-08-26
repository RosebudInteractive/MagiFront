import React from 'react'

export default function Mask(props) {

    const style = {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        borderBottomRightRadius: 4,
        background: `linear-gradient(90deg, transparent 65%, ${props.color} 100%)`,
    }

    return <div style={style}/>
}
