import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Autocomplete } from '#src/components/ui-kit';
import { lessonsSelector, getAllLessons } from '#src/ducks/dictionary';
import { imagesSelector, getImages, clearImages, fetchingSelector, } from '#src/ducks/images';
import { setInitState, applyFilter } from '#src/ducks/route';
import { convertFilter2Params, parseParams, resizeHandler, } from '#src/containers/images/tools';
import { ImagesGrid } from '#src/components/images/grid';
import './images.sass';
import { ImageView } from '#src/components/images/image-view';
import { useWindowSize } from '#src/tools/window-resize-hook';
import { ImageEditor } from '#src/components/images/image-editor';
const mapState = (state) => ({
    lessons: lessonsSelector(state),
    fetching: fetchingSelector(state),
    images: imagesSelector(state),
});
const mapDispatch = (dispatch) => ({
    actions: bindActionCreators({
        getAllLessons, getImages, setInitState, applyFilter, clearImages,
    }, dispatch),
});
const connector = connect(mapState, mapDispatch);
let imagesCount = 0;
const Images = ({ lessons, images, fetching, actions, }) => {
    const [visibleImage, setVisibleImage] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
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
        setShowEditor(true);
    };
    const handleCloseEditor = () => {
        setCurrentImage(null);
        setShowEditor(false);
    };
    return (<div className="images-page form _scrollable-y">
      <h5 className="form-header _grey70">Изображения</h5>
      <Autocomplete options={options} label="Лекция" input={{ value: lessonId, onChange: handleLessonChange }}/>
      <div className="images-page__grid-container">
        {images
            ? <ImagesGrid data={images} onImageClick={handleImageClick} onDoubleClick={editImage}/>
            : <div className="images-page__placeholder">Выберите лекцию</div>}
        {visibleImage && <ImageView image={visibleImage} onClose={handleCloseImageView}/>}
        {showEditor && currentImage
            && <ImageEditor image={currentImage} onClose={handleCloseEditor}/>}
      </div>
    </div>);
};
export default connector(Images);
