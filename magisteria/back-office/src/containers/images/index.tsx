import React, {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Autocomplete } from '#src/components/ui-kit';
import { lessonsSelector, getAllLessons } from '#src/ducks/dictionary';
import { permissionsSelector } from '#src/ducks/auth';
import {
  fetchingSelector,
  imagesSelector,
  searchResultSelector,
  currentSelector,
  getImages,
  addImage,
  saveImage,
  deleteImage,
  clearImages,
  searchImage,
  setCurrentImage,
} from '#src/ducks/images';
import { setInitState, applyFilter } from '#src/ducks/route';
import { LessonDbInfo } from '#types/lessons';
import {
  convertFilter2Params, Filter, Params, parseParams, resizeHandler,
} from '#src/containers/images/tools';
import { ImagesGrid } from '#src/components/images/grid';
import './images.sass';
import { ImageInfo, SearchResultItem, UploadMetaData } from '#types/images';
import { ImageView } from '#src/components/images/image-view';
import { useWindowSize } from '#src/tools/window-resize-hook';
import { ImageEditor } from '#src/components/images/image-editor';
import { AccessLevels } from '#src/constants/permissions';
import Lamp from '#src/assets/svg/lamp.svg';
import AddImage from '#src/assets/svg/add-image.svg';
import { ImageSearch } from '#src/components/images/search-form';
import { ToolbarButton } from '#src/components/ui-kit-2/toolbar-button';
import { ModalContainer } from '#src/components/ui-kit-2/modal-container';
import { convertSearchResultToImageInfo, createImageInfoFromUploadMetaData } from '#src/tools/images';

const mapState = (state: any) => ({
  lessons: lessonsSelector(state),
  fetching: fetchingSelector(state),
  images: imagesSelector(state),
  searchResult: searchResultSelector(state),
  currentImage: currentSelector(state),
  permissions: permissionsSelector(state),
});

const mapDispatch = (dispatch: any) => ({
  actions: bindActionCreators({
    getAllLessons,
    getImages,
    setInitState,
    applyFilter,
    clearImages,
    addImage,
    saveImage,
    deleteImage,
    searchImage,
    setCurrentImage,
  }, dispatch),
});

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

let imagesCount: number = 0;

const Images = ({
  lessons, images, permissions, fetching, actions, searchResult, currentImage,
}: Props) => {
  const [visibleImage, setVisibleImage] = useState<ImageInfo | null>(null);
  const [searchVisible, setSearchVisible] = useState<boolean>(false);
  // const [currentImage, setCurrentImage] = useState<ImageInfo | null>(null);
  const location = useLocation();
  const filter = useRef<Filter | null>(null);

  useWindowSize(() => {
    resizeHandler(imagesCount);
  });

  useLayoutEffect(() => {
    imagesCount = images ? images.length : 0;
    resizeHandler(imagesCount);

    if (currentImage) {
      const image = images && images.find((item) => item.id === currentImage.id);
      actions.setCurrentImage(image || null);
    }
  }, [images]);

  const handleLessonChange = (id: number | null) => {
    filter.current = { ...filter.current, lessonId: id || undefined };
    actions.applyFilter(convertFilter2Params(filter.current));
  };

  const options = useMemo(() => lessons
      && lessons.map((item: LessonDbInfo) => ({ id: item.Id, name: item.Name })), [lessons]);

  useEffect(() => {
    const initState: Params = parseParams();

    if (initState.parsedFilter) {
      filter.current = initState.parsedFilter;
      initState.filter = convertFilter2Params(initState.parsedFilter);
    } else {
      filter.current = null;
    }

    initState.pathname = location.pathname;

    actions.setInitState(initState);

    if (!fetching) {
      actions.getAllLessons();
      if (filter.current && filter.current.lessonId) {
        actions.getImages({ lessonId: filter.current.lessonId });
      } else {
        actions.clearImages();
      }
    }
  }, [location]);

  const handleImageClick = useCallback((data: ImageInfo) => { setVisibleImage(data); },
    [visibleImage]);

  const handleCloseImageView = useCallback(() => { setVisibleImage(null); }, [visibleImage]);

  const lessonId = filter.current && filter.current.lessonId;

  const editImage = (data: ImageInfo) => {
    actions.setCurrentImage(data);
  };

  const handleCloseEditor = () => {
    actions.setCurrentImage(null);
  };

  const openSearch = () => {
    setSearchVisible(true);
    if (currentImage) {
      actions.setCurrentImage(null);
    }
  };

  const handleCloseSearchForm = () => {
    setSearchVisible(false);
  };

  const handleForward = () => {
    if (images && currentImage) {
      const currentIndex: number = images.findIndex((item) => item.id === currentImage.id);
      if (currentIndex < (images.length - 1)) {
        actions.setCurrentImage(images[currentIndex + 1]);
      }
    }
  };

  const handleBackward = () => {
    if (images && currentImage) {
      const currentIndex: number = images.findIndex((item) => item.id === currentImage.id);
      if (currentIndex > 0) {
        actions.setCurrentImage(images[currentIndex - 1]);
      }
    }
  };

  const handleApply = (data: ImageInfo) => {
    if (filter.current) {
      actions.saveImage({ lessonId: filter.current.lessonId, image: data });
    }
  };

  const handleApplySearch = (data: SearchResultItem) => {
    setSearchVisible(false);
    if (filter.current) {
      const inArray = images && images.find((item) => item.id === data.id);

      if (!inArray) {
        const newImage = convertSearchResultToImageInfo(data);
        actions.setCurrentImage(newImage);
        actions.addImage({ lessonId: filter.current.lessonId, image: newImage });
      } else {
        actions.setCurrentImage(inArray);
      }
    }
  };

  const handleUploadImage = (data: string) => {
    const metaData: Array<UploadMetaData> = JSON.parse(data);
    if (metaData.length > 0) {
      setSearchVisible(false);
      if (filter.current) {
        const newImageInfo = createImageInfoFromUploadMetaData(metaData[0]);
        actions.addImage({ lessonId: filter.current.lessonId, image: newImageInfo });
      }
    }
  };

  const handleDelete = (id: number) => {
    if (filter.current) {
      actions.deleteImage({ lessonId: filter.current.lessonId, imageId: id });
    }
  };

  const handleSearch = (searchValue: string) => {
    actions.searchImage(searchValue);
  };

  const accessLevel: number = permissions.pic ? permissions.pic.al : 0;

  const lampColor = useMemo<'green' | 'red'>(() => (images && (images.length > 0) && images.some((item) => !item.isModerated) ? 'red' : 'green'), [images]);

  return (
    <div className="images-page form _scrollable-y">
      {lessonId && (accessLevel >= AccessLevels.images.moderate)
          && (
          <div className={`images-page__lamp ${lampColor}`}>
            <Lamp />
          </div>
          )}
      <h5 className="form-header _grey70">Изображения</h5>
      <div className="images-page__filter-pane">
        <Autocomplete options={options} label="Лекция" input={{ value: lessonId, onChange: handleLessonChange }} />
      </div>
      {
        lessonId && (accessLevel > AccessLevels.images.view)
        && (
          <ToolbarButton icon={<AddImage />} tooltipText="Добавить новое" appearance="grey" onClick={openSearch} />
        )
      }
      <div className="images-page__grid-container">
        { images
          ? (
            <ImagesGrid
              id="main"
              data={images}
              selected={currentImage ? currentImage.id : null}
              onImageClick={handleImageClick}
              onDoubleClick={editImage}
              onDelete={accessLevel > AccessLevels.images.view ? handleDelete : undefined}
            />
          )
          : <div className="images-page__placeholder">Выберите лекцию</div> }
        { visibleImage && (
        <ModalContainer
          renderContent={() => <ImageView image={visibleImage} onClose={handleCloseImageView} />}
        />
        )}
        { currentImage
            && (
            <ModalContainer renderContent={(props) => (
              <ImageEditor
                image={currentImage}
                accessLevel={accessLevel}
              // accessLevel={AccessLevels.images.edit}
                onClose={handleCloseEditor}
                onForward={handleForward}
                onBackward={handleBackward}
                onApply={handleApply}
                onAdd={openSearch}
                {...props}
              />
            )}
            />
            )}
        {searchVisible && (
        <ModalContainer renderContent={(props) => (
          <ImageSearch
            images={searchResult}
            onApply={handleApplySearch}
            onSearch={handleSearch}
            onClose={handleCloseSearchForm}
            onUpload={handleUploadImage}
            {...props}
          />
        )}
        />
        )}
      </div>
    </div>
  );
};

export default connector(Images);
