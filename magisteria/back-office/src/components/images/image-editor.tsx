import React, { useEffect, useLayoutEffect, useMemo } from 'react';
import './image-editor.sass';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import type { ImageInfo } from '#types/images';
import AddImage from '#src/assets/svg/add-image.svg';
import Forward from '#src/assets/svg/link-arrow-add.svg';
import Backward from '#src/assets/svg/link-arrow-del.svg';
import Apply from '#src/assets/svg/edit-apply.svg';
import Rollback from '#src/assets/svg/edit-cancel.svg';
import { Checkbox, RadioButtonsGroup, TextField } from '#src/components/ui-kit-2';
import { AccessLevels } from '#src/constants/permissions';

export interface ImageEditorProps {
  image: ImageInfo,
  accessLevel: number,
  onApply?: (data: ImageInfo) => void,
  onClose?: () => void,
  onForward?: () => void;
  onBackward?: () => void;
}

export const ImageEditor = ({
  image, accessLevel, onClose, onApply, onForward, onBackward,
} : ImageEditorProps) => {
  const {
    control, handleSubmit, reset,
  } = useForm<ImageInfo>({ defaultValues: image });

  const imageDataEmpty = !image.name
      && !image.description
      && !image.altAttribute
      && !image.artifactText
      && !image.authorText
      && image.museumText
      && !image.descriptor;

  const canEdit = (accessLevel === AccessLevels.images.edit
          && (image.status !== 1 || imageDataEmpty))
  || accessLevel > AccessLevels.images.edit;
  const readOnly = !canEdit;

  const onSubmit: SubmitHandler<ImageInfo> = (data) => {
    if (readOnly) return;

    if (onApply) onApply(data);
  };

  useEffect(() => {
    reset(image);
  }, [image]);

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

  const handleAddClick = () => {};

  const handleForwardClick = () => { if (onForward) onForward(); };

  const handleBackwardClick = () => { if (onBackward) onBackward(); };

  const handleRollbackClick = () => { reset(); };

  const fileName = useMemo<string>(() => {
    const path = image.metaData.content.m
        || image.metaData.content.l
        || null;

    const file = path ? image.metaData.path + path : image.fileName;
    return `/data/${file}`;
  }, [image]);

  return (
    <form className="image-editor" onSubmit={handleSubmit(onSubmit)}>
      <div className="image-editor__controls">
        {
          accessLevel > AccessLevels.images.view
            && (
            <button type="button" className="open-form-button _grey" onClick={handleAddClick}>
              <AddImage />
            </button>
            )
        }
        <button type="button" className="open-form-button _grey" onClick={handleBackwardClick}>
          <Backward />
        </button>
        <button type="button" className="open-form-button _grey" onClick={handleForwardClick}>
          <Forward />
        </button>
        <button type="submit" className="open-form-button">
          <Apply />
        </button>
        <button type="button" className="open-form-button" onClick={handleRollbackClick}>
          <Rollback />
        </button>
      </div>
      <div className="image-editor__data">
        <div className="image-editor__img">
          <img
            src={fileName}
            alt={image.description}
          />
        </div>
        <div className="image-editor__pane _with-custom-scroll">
          <div className="image-editor__pane-wrapper">
            <Controller
              name="name"
              control={control}
              render={({ field }) => <TextField label="Название" disabled={readOnly} multiline {...field} />}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => <TextField label="Описание" disabled={readOnly} multiline {...field} />}
            />
            <Controller
              name="altAttribute"
              control={control}
              render={({ field }) => <TextField label="Доп.атрибуты" disabled={readOnly} multiline {...field} />}
            />
            <Controller
              name="artifactText"
              control={control}
              render={({ field }) => <TextField label="Артефакты" disabled={readOnly} multiline {...field} />}
            />
            <Controller
              name="authorText"
              control={control}
              render={({ field }) => <TextField label="Автор" disabled={readOnly} multiline {...field} />}
            />
            <Controller
              name="museumText"
              control={control}
              render={({ field }) => <TextField label="Музей" disabled={readOnly} multiline {...field} />}
            />
            <Controller
              name="descriptor"
              control={control}
              render={({ field }) => <TextField label="Дескриптор" disabled={readOnly} multiline {...field} />}
            />
            <Controller
              name="isFragment"
              control={control}
              render={({ field }) => <Checkbox label="Фрагмент" disabled={readOnly} {...field} />}
            />
            <Controller
              name="linkTypeId"
              control={control}
              render={({ field }) => (
                <RadioButtonsGroup
                  label="Тип связи"
                  disabled={readOnly}
                  options={[
                    { value: '3', label: 'Иллюстративная' },
                    { value: '4', label: 'Ассоциативная' },
                  ]}
                  {...field}
                />
              )}
            />
          </div>
        </div>
        <button type="button" className="modal-form__close-button" onClick={onClose}>Закрыть</button>
      </div>
    </form>
  );
};
