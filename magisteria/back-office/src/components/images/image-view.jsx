import React, { useRef } from 'react';
import './image-view.sass';
export const ImageView = ({ image, onClose }) => {
    const horizontal = image.metaData.size.width > image.metaData.size.height;
    const ref = useRef(null);
    // useLayoutEffect(() => {
    //     const k: number = image.metaData.size.width > image.metaData.size.height;
    //     if (horizontal) {
    //         const
    //     }
    // }, [ref]);
    return (<div className={`image-view__dialog ${horizontal ? '_horizontal' : '_vertical'}`}>
      <img ref={ref} src={`/data/${image.fileName}`} alt={image.description}/>
      <button type="button" className="modal-form__close-button" onClick={onClose}>Закрыть</button>
    </div>);
};
