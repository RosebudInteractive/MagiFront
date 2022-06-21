import React, { useLayoutEffect, useRef, useState } from 'react';
import './image-view.sass';
import type { ImageInfo } from '#types/images';
import { useWindowSize } from '#src/tools/window-resize-hook';

export interface ImageViewProps {
  image: ImageInfo,
  onClose: () => void
}

export const ImageView = ({ image, onClose } : ImageViewProps) => {
  const ref = useRef<HTMLImageElement | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  const resizeHandler = () => {
    if (ref.current) {
      const imageRatio = image.metaData.size.width / image.metaData.size.height;
      const landscape = imageRatio > 1;

      if (landscape) {
        let imgWidth = window.innerWidth * 0.9 - 48;
        let imgHeight = imgWidth / imageRatio;

        if (imgHeight > window.innerHeight * 0.9 - 48) {
          imgHeight = window.innerHeight * 0.9 - 48;
          imgWidth = imgHeight * imageRatio;
        }

        setWidth(imgWidth);
        setHeight(imgHeight);
      } else {
        let imgHeight = window.innerHeight * 0.9 - 48;
        let imgWidth = imgHeight * imageRatio;

        if (imgWidth > window.innerWidth * 0.9 - 48) {
          imgWidth = window.innerWidth * 0.9 - 48;
          imgHeight = imgWidth / imageRatio;
        }

        setWidth(imgWidth);
        setHeight(imgHeight);
      }
    }
  };

  useWindowSize(() => {
    resizeHandler();
  });

  const handleImageLoad = () => {
    setLoaded(true);
    resizeHandler();
  };

  useLayoutEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Escape') {
        onClose();
      }
    }

    function onClick(e: MouseEvent) {
      // @ts-ignore
      if (e.target && !e.target.closest('.image-view__dialog')) onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mouseup', onClick);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mouseup', onClick);
    };
  }, []);

  return (
    <div className={`image-view__dialog ${!loaded ? '_loading' : ''}`}>
      <img
        ref={ref}
        style={{ width: width || 'auto', height: height || 'auto' }}
        src={`/data/${image.fileName}`}
        alt={image.description}
        onLoad={handleImageLoad}
      />
      <button type="button" className="modal-form__close-button" onClick={onClose}>Закрыть</button>
    </div>
  );
};
