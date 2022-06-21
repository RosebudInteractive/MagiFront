import React, { useLayoutEffect } from 'react';
import './image-editor.sass';
import { useForm, SubmitHandler } from 'react-hook-form';
import type { ImageInfo } from '#types/images';
// import { TextBox } from '#src/components/ui-kit';
import PlusIco from '#src/assets/svg/plus.svg';
import Forward from '#src/assets/svg/link-arrow-add.svg';
import Backward from '#src/assets/svg/link-arrow-del.svg';
import Apply from '#src/assets/svg/edit-apply.svg';
import Rollback from '#src/assets/svg/edit-cancel.svg';
import { TextBox } from '#src/components/ui-kit';

export interface ImageViewProps {
  image: ImageInfo,
  onClose: () => void
}

export const ImageEditor = ({ image, onClose } : ImageViewProps) => {
  const { register, handleSubmit } = useForm<ImageInfo>();
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

    function onClick(e: MouseEvent) {
      // @ts-ignore
      if (e.target && !e.target.closest('.image-view__dialog')) onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mouseup', onClick);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mouseup', onClick);
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
        <button type="button" className="open-form-button" onClick={handleForwardClick}>
          <Apply />
        </button>
        <button type="button" className="open-form-button" onClick={handleForwardClick}>
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
        <div className="image-editor__pane">

          <TextBox label="Название" multiline={true} />
          <TextBox label="Описание" multiline={true} />
          <TextBox label="Доп.атрибуты" multiline={true} />
          <TextBox label="Артефакты" multiline={true} />
          <TextBox label="Автор" multiline={true} />

        </div>
        <button type="button" className="modal-form__close-button" onClick={onClose}>Закрыть</button>
      </div>
    </form>
  );
};
