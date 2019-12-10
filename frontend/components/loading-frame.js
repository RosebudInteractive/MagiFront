import React from 'react';

const LoadingFrame = (props) => (
    <div className={"loading-frame" + (props.extClass ? ` ${props.extClass}` : "")}>
        <p>Загрузка...</p>
    </div>
);

export default LoadingFrame;