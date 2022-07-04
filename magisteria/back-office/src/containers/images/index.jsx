import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Autocomplete } from '#src/components/ui-kit';
import { lessonsSelector, getAllLessons } from '#src/ducks/dictionary';
import { permissionsSelector } from '#src/ducks/auth';
import { fetchingSelector, imagesSelector, searchResultSelector, getImages, saveImages, deleteImage, clearImages, searchImage, } from '#src/ducks/images';
import { setInitState, applyFilter } from '#src/ducks/route';
import { convertFilter2Params, parseParams, resizeHandler, } from '#src/containers/images/tools';
import { ImagesGrid } from '#src/components/images/grid';
import './images.sass';
import { ImageView } from '#src/components/images/image-view';
import { useWindowSize } from '#src/tools/window-resize-hook';
import { ImageEditor } from '#src/components/images/image-editor';
import { AccessLevels } from '#src/constants/permissions';
import Lamp from '#src/assets/svg/lamp.svg';
import AddImage from '#src/assets/svg/add-image.svg';
import { ImageSearch } from '#src/components/images/search-form';
const mapState = (state) => ({
    lessons: lessonsSelector(state),
    fetching: fetchingSelector(state),
    images: imagesSelector(state),
    searchResult: searchResultSelector(state),
    permissions: permissionsSelector(state),
});
const mapDispatch = (dispatch) => ({
    actions: bindActionCreators({
        getAllLessons,
        getImages,
        setInitState,
        applyFilter,
        clearImages,
        saveImages,
        deleteImage,
        searchImage,
    }, dispatch),
});
const connector = connect(mapState, mapDispatch);
let imagesCount = 0;
const Images = ({ lessons, images, permissions, fetching, actions, searchResult, }) => {
    const [visibleImage, setVisibleImage] = useState(null);
    const [searchVisible, setSearchVisible] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const location = useLocation();
    const filter = useRef(null);
    useWindowSize(() => {
        resizeHandler(imagesCount);
    });
    useLayoutEffect(() => {
        imagesCount = images ? images.length : 0;
        resizeHandler(imagesCount);
    }, [images]);
    const handleLessonChange = (id) => {
        filter.current = { ...filter.current, lessonId: id || undefined };
        actions.applyFilter(convertFilter2Params(filter.current));
    };
    const options = useMemo(() => lessons
        && lessons.map((item) => ({ id: item.Id, name: item.Name })), [lessons]);
    useEffect(() => {
        const initState = parseParams();
        if (initState.parsedFilter) {
            filter.current = initState.parsedFilter;
            initState.filter = convertFilter2Params(initState.parsedFilter);
        }
        else {
            filter.current = null;
        }
        initState.pathname = location.pathname;
        actions.setInitState(initState);
        if (!fetching) {
            actions.getAllLessons();
            if (filter.current && filter.current.lessonId) {
                actions.getImages({ lessonId: filter.current.lessonId });
            }
            else {
                actions.clearImages();
            }
        }
    }, [location]);
    const handleImageClick = useCallback((data) => { setVisibleImage(data); }, [visibleImage]);
    const handleCloseImageView = useCallback(() => { setVisibleImage(null); }, [visibleImage]);
    const lessonId = filter.current && filter.current.lessonId;
    const editImage = (data) => {
        setCurrentImage(data);
    };
    const handleCloseEditor = () => {
        setCurrentImage(null);
    };
    const openSearch = () => {
        setSearchVisible(true);
        if (currentImage) {
            setCurrentImage(null);
        }
    };
    const handleCloseSearchForm = () => {
        setSearchVisible(false);
    };
    const handleForward = () => {
        if (images && currentImage) {
            const currentIndex = images.findIndex((item) => item.id === currentImage.id);
            if (currentIndex < (images.length - 1)) {
                setCurrentImage(images[currentIndex + 1]);
            }
        }
    };
    const handleBackward = () => {
        if (images && currentImage) {
            const currentIndex = images.findIndex((item) => item.id === currentImage.id);
            if (currentIndex > 0) {
                setCurrentImage(images[currentIndex - 1]);
            }
        }
    };
    const handleApply = (data) => {
        if (images && filter.current) {
            const newImages = [...images];
            const image = newImages.find((item) => item.id === data.id);
            if (image) {
                image.resType = data.resType;
                image.fileName = data.fileName;
                image.resLanguageId = data.resLanguageId;
                image.showInGallery = data.showInGallery;
                image.language = data.language;
                image.name = data.name;
                image.description = data.description;
                image.altAttribute = data.altAttribute;
                image.metaData = { ...data.metaData };
                image.artifactText = data.artifactText;
                image.authorText = data.authorText;
                image.museumText = data.museumText;
                image.descriptor = data.descriptor;
                image.isFragment = data.isFragment;
                image.status = data.status;
                image.isNew = data.isNew;
                image.linkTypeId = data.linkTypeId;
                image.timeCr = data.timeCr;
            }
            actions.saveImages({ lessonId: filter.current.lessonId, images: newImages });
        }
    };
    const handleApplySearch = (data) => {
        console.log(data);
    };
    const handleDelete = (id) => {
        if (images && filter.current) {
            actions.deleteImage({ lessonId: filter.current.lessonId, imageId: id });
        }
    };
    const handleSearch = (searchValue) => {
        actions.searchImage(searchValue);
    };
    const accessLevel = permissions.pic ? permissions.pic.al : 0;
    const lampColor = useMemo(() => (images && (images.length > 0) && images.some((item) => item.status !== 1) ? 'red' : 'green'), [images]);
    return (<div className="images-page form _scrollable-y">
      {lessonId && (accessLevel >= AccessLevels.images.moderate)
            && (<div className={`images-page__lamp ${lampColor}`}>
            <Lamp />
          </div>)}
      <h5 className="form-header _grey70">Изображения</h5>
      <div className="images-page__filter-pane">
        <Autocomplete options={options} label="Лекция" input={{ value: lessonId, onChange: handleLessonChange }}/>
      </div>
      {lessonId && (accessLevel > AccessLevels.images.view)
            && (<button type="button" className="toolbar-button _add" onClick={openSearch}>
            <AddImage />
          </button>)}
      <div className="images-page__grid-container">
        {images
            ? (<ImagesGrid id="main" data={images} selected={currentImage ? currentImage.id : null} onImageClick={handleImageClick} onDoubleClick={editImage} onDelete={accessLevel > AccessLevels.images.view ? handleDelete : undefined}/>)
            : <div className="images-page__placeholder">Выберите лекцию</div>}
        {visibleImage && <ImageView image={visibleImage} onClose={handleCloseImageView}/>}
        {currentImage
            && (<ImageEditor image={currentImage} accessLevel={accessLevel} 
            // accessLevel={AccessLevels.images.edit}
            onClose={handleCloseEditor} onForward={handleForward} onBackward={handleBackward} onApply={handleApply}/>)}
        {searchVisible && (<ImageSearch images={searchResult} onApply={handleApplySearch} onSearch={handleSearch} onClose={handleCloseSearchForm}/>)}
      </div>
    </div>);
};
export default connector(Images);
