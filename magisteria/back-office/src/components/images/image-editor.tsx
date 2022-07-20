import React, {
  useCallback,
  useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import './image-editor.sass';
import {
  useForm, Controller, SubmitHandler, useFormState,
} from 'react-hook-form';
import styled from 'styled-components';
import type { ImageInfo } from '#types/images';
import AddImage from '#src/assets/svg/add-image.svg';
import Forward from '#src/assets/svg/link-arrow-add.svg';
import Backward from '#src/assets/svg/link-arrow-del.svg';
import Apply from '#src/assets/svg/edit-apply.svg';
import Rollback from '#src/assets/svg/edit-cancel.svg';
import { Checkbox, RadioButtonsGroup, TextField } from '#src/components/ui-kit-2';
import { AccessLevels } from '#src/constants/permissions';
import { ToolbarButton } from '#src/components/ui-kit-2/toolbar-button';
import { UserConfirmation } from '#src/components/messages/user-confirmation';

export interface ImageEditorProps {
  image: ImageInfo,
  accessLevel: number,
  onApply?: (data: ImageInfo) => void,
  onClose?: () => void,
  onForward?: () => void;
  onBackward?: () => void;
  onAdd?: () => void;
}

type ConfirmCallback = (value: boolean) => void;

const Toolbar = styled.div`
  display: flex;
  flex-direction: row;
  padding-bottom: 8px;
`;

export const ImageEditor = ({
  image, accessLevel, onAdd, onClose, onApply, onForward, onBackward,
} : ImageEditorProps) => {
  const {
    control, handleSubmit, reset,
  } = useForm<ImageInfo>({ defaultValues: image });
  const { isDirty } = useFormState({ control });
  const [confirmCallback, setConfirmCallback] = useState<ConfirmCallback | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const closeOnConfirm = useCallback((confirm: boolean) => {
    setConfirmCallback(null);
    if (confirm && onClose) onClose();
  }, [onClose, confirmCallback]);

  const backOnConfirm = useCallback((confirm: boolean) => {
    setConfirmCallback(null);
    if (confirm && onBackward) onBackward();
  }, [onBackward, confirmCallback]);

  const forwardOnConfirm = useCallback((confirm: boolean) => {
    setConfirmCallback(null);
    if (confirm && onForward) onForward();
  }, [onForward, confirmCallback]);

  const onCloseQuery = () => {
    if (!onClose) return;

    if (isDirty) {
      setConfirmCallback(() => closeOnConfirm);
    } else onClose();
  };

  const handleBackwardClick = () => {
    if (!onBackward) return;

    if (isDirty) {
      setConfirmCallback(() => backOnConfirm);
    } else onBackward();
  };

  const handleForwardClick = () => {
    if (!onForward) return;

    if (isDirty) {
      setConfirmCallback(() => forwardOnConfirm);
    } else onForward();
  };

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

  const handleAddClick = () => { if (onAdd) onAdd(); };

  const handleRollbackClick = () => { reset(); };

  const fileName = useMemo<string>(() => {
    const path = image.metaData.content.m
        || image.metaData.content.l
        || null;

    const file = path ? image.metaData.path + path : image.fileName;
    return `/data/${file}`;
  }, [image]);

  return (
    <form ref={formRef} className="image-editor" onSubmit={handleSubmit(onSubmit)}>
      <Toolbar>
        {
          accessLevel > AccessLevels.images.view
            && (
            <ToolbarButton icon={<AddImage />} tooltipText="Новый" appearance="grey" onClick={handleAddClick} />
            )
        }
        <ToolbarButton icon={<Backward />} tooltipText="Предыдущий" appearance="grey" onClick={handleBackwardClick} />
        <ToolbarButton icon={<Forward />} tooltipText="Следующий" appearance="grey" onClick={handleForwardClick} />
        <ToolbarButton icon={<Apply />} tooltipText="Применить" type="submit" />
        <ToolbarButton icon={<Rollback />} tooltipText="Отменить изменения" onClick={handleRollbackClick} />
      </Toolbar>
      <div className="image-editor__data">
        <div className="image-editor__img">
          <img
            src={fileName}
            alt={image.description || ''}
          />
        </div>
        <div className="image-editor__pane _with-custom-scroll">
          <div className="image-editor__pane-wrapper">
            <Controller
              name="isModerated"
              control={control}
              render={({ field }) => <Checkbox label="Прошло модерацию" disabled={accessLevel < AccessLevels.images.moderate} {...field} />}
            />
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
              name="showInGallery"
              control={control}
              render={({ field }) => <Checkbox label="Показывать в галереи" disabled={readOnly} {...field} />}
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
        <button type="button" className="modal-form__close-button" onClick={onCloseQuery}>Закрыть</button>
      </div>
      { confirmCallback && <UserConfirmation callback={confirmCallback} />}
    </form>
  );
};
