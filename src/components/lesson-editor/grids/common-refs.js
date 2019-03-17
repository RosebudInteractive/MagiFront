import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import PropTypes from "prop-types";
import ReferenceDialog from "../dialogs/reference-dialog";
import LessonReferences from './lesson-refs-control'
import * as commonRefsActions from '../../../actions/lesson/lessonCommonRefsActions'
import {createNewReference, editReference, clearReference} from '../../../actions/references-actions';
import {EDIT_MODE_EDIT} from "../../../constants/Common";

class CommonRefsGrid extends React.Component {

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
                (this.props.showReferenceEditor && !this.props.reference.Recommended) ?
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

function mapStateToProps(state) {
    return {
        reference: state.references.reference,
        showReferenceEditor: state.references.showEditor,
        referenceEditMode: state.references.editMode,
        commonRef: state.lessonCommonRefs.current,
        selected: state.lessonCommonRefs.selected,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        commonRefsActions: bindActionCreators(commonRefsActions, dispatch),
        actions: bindActionCreators({createNewReference, editReference, clearReference,}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommonRefsGrid);



