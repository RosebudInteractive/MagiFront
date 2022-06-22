import React, { useLayoutEffect } from 'react';
import './image-editor.sass';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import type { ImageInfo } from '#types/images';
// import { TextBox } from '#src/components/ui-kit';
import PlusIco from '#src/assets/svg/plus.svg';
import Forward from '#src/assets/svg/link-arrow-add.svg';
import Backward from '#src/assets/svg/link-arrow-del.svg';
import Apply from '#src/assets/svg/edit-apply.svg';
import Rollback from '#src/assets/svg/edit-cancel.svg';
import { RadioButtonsGroup, TextBox } from '#src/components/ui-kit-2';

export interface ImageViewProps {
  image: ImageInfo,
  onClose: () => void
}

export const ImageEditor = ({ image, onClose } : ImageViewProps) => {
  const { control, handleSubmit } = useForm<ImageInfo>({ defaultValues: image });
  const onSubmit: SubmitHandler<ImageInfo> = (data) => console.log(data);

  // const ref = useRef<HTMLImageElement | null>(null);
  // const [width, setWidth] = useState<number | null>(null);
  // const [height, setHeight] = useState<number | null>(null);
  // const [loaded, setLoaded] = useState<boolean>(false);

  useLayoutEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleAddClick = () => {};

  const handleForwardClick = () => {};

  const handleBackwardClick = () => {};

  return (
    <form className="image-editor" onSubmit={handleSubmit(onSubmit)}>
      <div className="image-editor__controls">
        <button type="button" className="open-form-button _grey" onClick={handleAddClick}>
          <PlusIco />
        </button>
        <button type="button" className="open-form-button _grey" onClick={handleBackwardClick}>
          <Backward />
        </button>
        <button type="button" className="open-form-button _grey" onClick={handleForwardClick}>
          <Forward />
        </button>
        <button type="submit" className="open-form-button">
          <Apply />
        </button>
        <button type="reset" className="open-form-button">
          <Rollback />
        </button>
      </div>
      <div className="image-editor__data">
        <div className="image-editor__img">
          <img
            src={`/data/${image.fileName}`}
            alt={image.description}
          />
        </div>
        <div className="image-editor__pane _with-custom-scroll">
          <div className="image-editor__pane-wrapper">
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({ field }) => <TextBox label="Название" multiline {...field} />}
            />
            <Controller
              name="description"
              control={control}
              defaultValue=""
              render={({ field }) => <TextBox label="Описание" multiline {...field} />}
            />
            <Controller
              name="altAttribute"
              control={control}
              defaultValue=""
              render={({ field }) => <TextBox label="Доп.атрибуты" multiline {...field} />}
            />
            <Controller
              name="artifactText"
              control={control}
              defaultValue=""
              render={({ field }) => <TextBox label="Артефакты" multiline {...field} />}
            />
            <Controller
              name="authorText"
              control={control}
              defaultValue=""
              render={({ field }) => <TextBox label="Автор" multiline {...field} />}
            />
            <Controller
              name="museumText"
              control={control}
              defaultValue=""
              render={({ field }) => <TextBox label="Музей" multiline {...field} />}
            />
            <Controller
              name="descriptor"
              control={control}
              defaultValue=""
              render={({ field }) => <TextBox label="Дескриптор" multiline {...field} />}
            />
            <Controller
              name="linkTypeId"
              control={control}
              render={({ field }) => (
                <RadioButtonsGroup
                  label="Тип связи"
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
