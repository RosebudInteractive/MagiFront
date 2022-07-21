import React, {
  useCallback,
  useEffect, useLayoutEffect, useState,
} from 'react';
import './search-form.sass';
import type { SearchResultItem } from '#types/images';
import { TextField, Uploader } from '#src/components/ui-kit-2';
import { useWindowSize } from '#src/tools/window-resize-hook';
import { ModalContainer, RenderContentProps } from '#src/components/ui-kit-2/modal-container';
import { ImageView } from '#src/components/images/image-view';
import { SearchResultGrid } from '#src/components/images/search-result-grid';
import { ToolbarButton } from '#src/components/ui-kit-2/toolbar-button';
import Fit from '#src/assets/svg/fit.svg';
import Strech from '#src/assets/svg/strech.svg';

export interface ImageEditorProps extends RenderContentProps {
  images: Array<SearchResultItem> | null,
  onSearch: (data: string) => void,
  onApply: (data: SearchResultItem) => void,
  onUpload: (data: string) => void,
  onClose: () => void,
}

const TIMEOUT = 1000;

export const resizeHandler = (rowCount: number) => {
  const form = $('.search-form__grid');
  const height = form.height() || 0;
  const width = form.innerWidth() || 0;

  // @ts-ignore
  const grid: ui.datatable = window.$$('images-search-grid');

  if (grid) {
    const headerHeight = grid.config.headerRowHeight;

    setTimeout(() => {
      let gridHeight = height - headerHeight;

      const calcHeight = (rowCount * 200) + headerHeight + 24;
      gridHeight = calcHeight > gridHeight ? calcHeight : gridHeight;
      const gridWidth: number = gridHeight > height ? width - 10 : width;
      grid.$setSize(gridWidth, gridHeight);
    }, 0);
  }
};

export const ImageSearch = ({
  images = [], onSearch, onClose, onApply, onUpload, containerRef,
} : ImageEditorProps) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [clear, setClear] = useState<boolean>(true);
  const [visibleImage, setVisibleImage] = useState<SearchResultItem | null>(null);
  const [fitImageToCell, setFitImageToCell] = useState<boolean>(true);

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
    if (!clear) {
      resizeHandler(images ? images.length : 0);
    }
  }, [clear, images]);

  useLayoutEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Escape') {
        if (onClose) onClose();
      }
    }

    if (!visibleImage) document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [visibleImage]);

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleCloseImageView = useCallback(() => { setVisibleImage(null); }, [visibleImage]);

  const handleCheckboxChange = () => {
    setFitImageToCell(!fitImageToCell);
  };

  const icon = fitImageToCell ? <Strech /> : <Fit />;

  return (
    <div>
      <div className="search-form">
        <div className="search-form__search-string">
          <TextField label="Что ищем?" value={searchValue} onChange={handleChangeSearch} autoFocus />
          <ToolbarButton icon={icon} onClick={handleCheckboxChange} />
        </div>
        <div className="search-form__grid _with-custom-scroll">
          <div className="search-form__grid-container">
            {/* eslint-disable-next-line no-nested-ternary */}
            {clear
              ? <div className="search-form__container-text">Введите текст для поиска</div>
              : images && images.length
                ? (
                  <SearchResultGrid
                    data={images}
                    fitImageToCell={fitImageToCell}
                    onDoubleClick={onApply}
                    onImageClick={setVisibleImage}
                  />
                )
                : (
                  <div className="search-form__container-text">
                    Ничего не найдено, Вы можете загрузить свою картинку
                    <Uploader uploadURL="/api/pm/upload" buttonTitle="Загрузить картинку" onUploadFile={onUpload} />
                  </div>
                )}
          </div>
          <button type="button" className="modal-form__close-button" onClick={onClose}>Закрыть</button>
        </div>
      </div>
      { visibleImage && (
        <ModalContainer
          parentRef={containerRef}
          renderContent={() => (
            <ImageView
              absolutePath
              image={visibleImage}
              onClose={handleCloseImageView}
            />
          )}
        />
      )}
    </div>
  );
};
