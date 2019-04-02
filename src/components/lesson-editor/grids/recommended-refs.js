import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import PropTypes from "prop-types";
import ReferenceDialog from "../dialogs/reference-dialog";
import LessonReferences from './lesson-refs-control'

import * as recommendedRefsActions from '../../../actions/lesson/lessonRecommendedRefsActions'
import {createNewReference, editReference, clearReference} from '../../../actions/references-actions';
import {EDIT_MODE_EDIT} from "../../../constants/Common";

class RecommendedRefsGrid extends React.Component {

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
                              viewId={'recommended-refs'}
            />
            {
                (this.props.showReferenceEditor && this.props.reference.Recommended) ?
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

function mapStateToProps(state) {
    return {
        reference: state.references.reference,
        showReferenceEditor: state.references.showEditor,
        referenceEditMode: state.references.editMode,
        recommendedRefs: state.lessonRecommendedRefs.current,
        selected: state.lessonRecommendedRefs.selected,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        recommendedRefsActions: bindActionCreators(recommendedRefsActions, dispatch),
        actions: bindActionCreators({createNewReference, editReference, clearReference,}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RecommendedRefsGrid);