import React from "react";
import PropTypes from "prop-types";
import GridControl from "../../../gridControl";
import * as commonRefsActions from '../../../../actions/lesson/lessonCommonRefsActions'
import * as recommendedRefsActions from '../../../../actions/lesson/lessonRecommendedRefsActions'
import {createNewReference, editReference, clearReference} from '../../../../actions/references-actions';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import ReferenceDialog from "../../dialogs/reference-dialog";
import {EDIT_MODE_EDIT} from "../../../../constants/Common";

class CommonRefs extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    render() {
        return <div className="lesson-common-refs">
            <label className="grid-label">Список литературы</label>
            <LessonReferences selectAction={::this.props.commonRefsActions.select}
                              createAction={::this._create}
                              editAction={::this._edit}
                              removeAction={::this.props.commonRefsActions.remove}
                              moveUpAction={::this.props.commonRefsActions.moveUp}
                              moveDownAction={::this.props.commonRefsActions.moveDown}
                              editMode={this.props.editMode}
                              selected={this.props.selected}
                              data={this.props.commonRef}
            />
            {
                this.props.showReferenceEditor ?
                    <ReferenceDialog
                        cancel={::this._cancelEditReference}
                        save={::this._saveReference}
                        data={this.props.reference}
                    />
                    :
                    null
            }
        </div>

    }

    _create() {
        this.props.actions.createNewReference(false);
    }

    _edit(refId) {
        let _ref = this.props.commonRef.find((item) => {
            return item.id === parseInt(refId)
        });

        this.props.actions.editReference(_ref);
    }

    _cancelEditReference() {
        this.props.actions.clearReference();
    }

    _saveReference(value) {
        if (!value.Recommended) {
            if (this.props.referenceEditMode === EDIT_MODE_EDIT) {
                this.props.commonRefsActions.update(value)
            } else {
                this.props.commonRefsActions.insert(value)
            }
        }

        this.props.actions.clearReference();
    }
}

function mapStateToPropsCommon(state) {
    return {
        reference: state.references.reference,
        showReferenceEditor: state.references.showEditor,
        referenceEditMode: state.references.editMode,
        commonRef: state.lessonCommonRefs.current,
        selected: state.lessonCommonRefs.selected,
    }
}

function mapDispatchToPropsCommon(dispatch) {
    return {
        commonRefsActions: bindActionCreators(commonRefsActions, dispatch),
        actions: bindActionCreators({createNewReference, editReference, clearReference,}, dispatch)
    }
}

export const CommonRefsGrid = connect(mapStateToPropsCommon, mapDispatchToPropsCommon)(CommonRefs);

class RecommendedRefs extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    render() {
        return <div className="lesson-recommended-refs">
            <label className="grid-label">Рекомендуемая литература</label>
            <LessonReferences selectAction={::this.props.recommendedRefsActions.select}
                              createAction={::this._create}
                              editAction={::this._edit}
                              removeAction={::this.props.recommendedRefsActions.remove}
                              moveUpAction={::this.props.recommendedRefsActions.moveUp}
                              moveDownAction={::this.props.recommendedRefsActions.moveDown}
                              editMode={this.props.editMode}
                              selected={this.props.selected}
                              data={this.props.commonRef}
            />
            {
                this.props.showReferenceEditor ?
                    <ReferenceDialog
                        cancel={::this._cancelEditReference}
                        save={::this._saveReference}
                        data={this.props.reference}
                    />
                    :
                    null
            }
        </div>

    }

    _create() {
        this.props.actions.createNewReference(true);
    }

    _edit(refId) {
        let _ref = this.props.recommendedRefs.find((item) => {
            return item.id === parseInt(refId)
        });

        this.props.actions.editReference(_ref);
    }

    _cancelEditReference() {
        this.props.actions.clearReference();
    }

    _saveReference(value) {
        if (value.Recommended) {
            if (this.props.referenceEditMode === EDIT_MODE_EDIT) {
                this.props.recommendedRefsActions.update(value)
            } else {
                this.props.recommendedRefsActions.insert(value)
            }
        }

        this.props.actions.clearReference();
    }
}

class LessonReferences extends GridControl {

    _getId() {
        return 'lesson-refs';
    }

    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30},
            {id: 'Description', header: 'Описание', fillspace: true},
            {id: 'URL', header: 'URL', width: 120},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}


function mapStateToPropsRecommended(state) {
    return {
        reference: state.references.reference,
        showReferenceEditor: state.references.showEditor,
        referenceEditMode: state.references.editMode,
        recommendedRefs: state.lessonRecommendedRefs.current,
        selected: state.lessonRecommendedRefs.selected,
    }
}

function mapDispatchToPropsRecommended(dispatch) {
    return {
        recommendedRefsActions: bindActionCreators(recommendedRefsActions, dispatch),
        actions: bindActionCreators({createNewReference, editReference, clearReference,}, dispatch)
    }
}

export const RecommendedRefsGrid = connect(mapStateToPropsRecommended, mapDispatchToPropsRecommended)(RecommendedRefs);