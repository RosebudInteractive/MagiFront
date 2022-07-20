import React, { useLayoutEffect, useRef, useState } from 'react';
import './image-view.sass';
import styled, { css } from 'styled-components';
import type { ImageViewable } from '#types/images';
import { useWindowSize } from '#src/tools/window-resize-hook';

export interface ImageViewProps {
  image: ImageViewable,
  absolutePath?: boolean,
  onClose: () => void
}

const typography = css`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 22px;
  letter-spacing: 0.1px;
`;

const SizeInfo = styled.div`
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  ${typography}
`;

export const ImageView = ({ image, onClose, absolutePath = false } : ImageViewProps) => {
  const ref = useRef<HTMLImageElement | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  const resizeHandler = () => {
    if (ref.current) {
      const imageRatio = image.metaData.size.width / image.metaData.size.height;
      const landscape = imageRatio > 1;

      if (landscape) {
        let imgWidth = window.innerWidth * 0.9 - 64;
        let imgHeight = imgWidth / imageRatio;

        if (imgHeight > window.innerHeight * 0.9 - 64) {
          imgHeight = window.innerHeight * 0.9 - 64;
          imgWidth = imgHeight * imageRatio;
        }

        setWidth(imgWidth);
        setHeight(imgHeight);
      } else {
        let imgHeight = window.innerHeight * 0.9 - 64;
        let imgWidth = imgHeight * imageRatio;

        if (imgWidth > window.innerWidth * 0.9 - 64) {
          imgWidth = window.innerWidth * 0.9 - 64;
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
        src={absolutePath ? image.fileName : `/data/${image.fileName}`}
        alt={image.description || ''}
        onLoad={handleImageLoad}
      />
      <SizeInfo>{`${image.metaData.size.width}x${image.metaData.size.height}px`}</SizeInfo>
      <button type="button" className="modal-form__close-button" onClick={onClose}>Закрыть</button>
    </div>
  );
};
