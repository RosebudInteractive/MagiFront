import React, {useEffect, useRef, useState} from "react";
import './preview.sass'
import {Timeline} from "timeline/index";

export default function TimelinePreview(props) {
    const {background, events, periods} = props;
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
            <Timeline width={800} height={500} events={events ? events : []} zoom={1} periods={periods ? periods : []}/>
            </div>
            {
                background && <img alt={'timeline background'} onLoad={setVisible} className="normal" src={`/data/${background}`}/>
            }
        </div>
    )
}
