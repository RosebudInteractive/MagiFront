import React from "react";
import './preview.sass'

export default function TimelinePreview(props) {
    const {background} = props;

    return (
        <div className="timeline-preview" style={{backgroundImage: `linear-gradient(180deg, #00000070, #00000094), url('/data/${background}')`,
            backgroundPosition: "center",
            backgroundSize: "cover"}}>
            preview here
        </div>
    )
}
