import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState, } from 'react';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Autocomplete } from '#src/components/ui-kit';
import { lessonsSelector, getAllLessons } from '#src/ducks/dictionary';
import { fetching, imagesSelector, getImages } from '#src/ducks/images';
import { setInitState } from '#src/ducks/route';
import { parseParams, resizeHandler } from '#src/containers/images/tools';
import { ImagesGrid } from '#src/components/images/grid';
import './images.sass';
import { ImageView } from '#src/components/images/image-view';
import { useWindowSize } from '#src/tools/window-resize-hook';
const mapState = (state) => ({
    lessons: lessonsSelector(state),
    fetching: fetching(state),
    images: imagesSelector(state),
});
const mapDispatch = (dispatch) => ({
    actions: bindActionCreators({ getAllLessons, getImages, setInitState }, dispatch),
});
const connector = connect(mapState, mapDispatch);
let imagesCount = 0;
const Images = ({ lessons, images, actions }) => {
    const [lessonId, setLessonId] = useState(null);
    const [visibleImage, setVisibleImage] = useState(null);
    const location = useLocation();
    useWindowSize(() => {
        resizeHandler(imagesCount);
    });
    useLayoutEffect(() => {
        imagesCount = images ? images.length : 0;
        resizeHandler(imagesCount);
    }, [images]);
    useEffect(() => {
        if (lessonId)
            actions.getImages({ lessonId });
    }, [lessonId]);
    const handleLessonChange = (id) => {
        setLessonId(id);
    };
    const options = useMemo(() => lessons
        && lessons.map((item) => ({ id: item.Id, name: item.Name })), [lessons]);
    useEffect(() => {
        const initState = parseParams();
        // if (!isMounted.current && (Object.keys(initState).length === 0)) {
        //   initState = savedFilters.getFor(FILTER_KEY.PROCESSES);
        //   initState.replacePath = true;
        // } else {
        //   savedFilters.setFor(FILTER_KEY.PROCESSES, { ...initState });
        // }
        //
        // isMounted.current = true;
        // if (initState.order) {
        //   _sortRef.current = initState.order;
        //   const _grid = window.webix.$$('processes-grid');
        //   if (_grid) {
        //     _grid.markSorting(_sortRef.current.field, _sortRef.current.direction);
        //   }
        // }
        // if (initState.filter) {
        //   filter.current = initState.filter;
        //   initState.filter = convertFilter2Params(initState.filter);
        // } else {
        //   filter.current = null;
        // }
        initState.pathname = location.pathname;
        actions.setInitState(initState);
        if (!fetching) {
            actions.getAllLessons();
            if (lessonId)
                actions.getImages({ lessonId });
        }
    }, [location]);
    const handleImageClick = useCallback((data) => { setVisibleImage(data); }, [visibleImage]);
    const handleCloseImageView = useCallback(() => { setVisibleImage(null); }, [visibleImage]);
    return (<div className="images-page form _scrollable-y">
      <h5 className="form-header _grey70">Изображения</h5>
      <Autocomplete options={options} label="Лекция" input={{ value: lessonId, onChange: handleLessonChange }}/>
      <div className="images-page__grid-container">
        {images ? <ImagesGrid data={images} onImageClick={handleImageClick}/>
            : <div className="images-page__placeholder">Выберите лекцию</div>}
        {visibleImage && <ImageView image={visibleImage} onClose={handleCloseImageView}/>}
      </div>
    </div>);
};
export default connector(Images);
