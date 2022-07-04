import React, { useEffect, useLayoutEffect, useState } from 'react';
import './search-form.sass';
import type { ImageInfo } from '#types/images';
import { TextField } from '#src/components/ui-kit-2';
import { ImagesGrid } from '#src/components/images/grid';
import { useWindowSize } from '#src/tools/window-resize-hook';

export interface ImageEditorProps {
  images: Array<ImageInfo> | null,
  onSearch: (data: string) => void,
  onApply: (data: ImageInfo) => void,
  onClose: () => void,
}

const TIMEOUT = 1000;

export const resizeHandler = (rowCount: number) => {
  const form = $('.search-form__grid');
  const height = form.height();
  const width = form.width();

  // @ts-ignore
  if (window.$$('images-grid search')) {
    // @ts-ignore
    const headerHeight = window.$$('images-grid search').config.headerRowHeight;

    setTimeout(() => {
      let gridHeight = (height || 0) - headerHeight;

      const calcHeight = (rowCount * 80) + headerHeight + 24;
      gridHeight = calcHeight > gridHeight ? calcHeight : gridHeight;
      // @ts-ignore
      window.$$('images-grid search').$setSize(width, gridHeight);
    }, 0);
  }
};

export const ImageSearch = ({
  images = [], onSearch, onClose, onApply,
} : ImageEditorProps) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [clear, setClear] = useState<boolean>(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue) onSearch(searchValue);
      setClear(!searchValue);
    }, TIMEOUT);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchValue]);

  useWindowSize(() => {
    resizeHandler(images ? images.length : 0);
  });

  useEffect(() => {
    // @ts-ignore
    if (!clear) resizeHandler(images ? images.length : 0);
  }, [clear, images]);

  useLayoutEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Escape') {
        if (onClose) onClose();
      }
    }

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <div className="search-form">
      <div className="search-form__search-string">
        <TextField label="Что ищем?" value={searchValue} onChange={handleChangeSearch} />
      </div>
      <div className="search-form__grid">
        <div className="search-form__grid-container _with-custom-scroll">
          {/* eslint-disable-next-line no-nested-ternary */}
          {clear
            ? <div className="search-form__container-text">Введите текст для поиска</div>
            : images && images.length
              ? <ImagesGrid absolutePath id="search" data={images} onDoubleClick={onApply} />
              : (
                <div className="search-form__container-text">
                  Ничего не найдено, Вы можете загрузить свою картинку
                  <button type="button" className="orange-button big-button">Загрузить картинку</button>
                </div>
              )}
        </div>
        <button type="button" className="modal-form__close-button" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};
