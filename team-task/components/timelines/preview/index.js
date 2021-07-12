import React, {useEffect, useRef, useState} from "react";
import './preview.sass'

export default function TimelinePreview(props) {
    const {background} = props;
    const blockRef = useRef();
    //todo fadeIn fadeOut??
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        // setOpacity(0);
        // console.log('blockRef:', blockRef)
        // setTimeout(() => {
        //     setOpacity(1);
        // }, 1500);
        // if(blockRef.current){
        //     setOpacity(1)
        // }
    }, [background]);

    function setVisible() {
        // setOpacity(0);
        // console.log('onload works setVisible');
        // setTimeout(() => {
        //     setOpacity(1)
        // }, 1500);
    }

    return (
        <div ref={blockRef} className="timeline-preview">
            <div className="image-filter">

            </div>
            <img onLoad={setVisible} className="normal" src={`/data/${background}`}/>
        </div>
    )
}
