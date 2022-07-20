import React, {
  forwardRef, ButtonHTMLAttributes, useRef,
} from 'react';
import assignRef from '#src/tools/assignRef';
import { Button } from '#src/components/ui-kit-2/button';

interface ProgressOptions {
  file: File;
  percent: number
}

export interface UploaderProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  uploadURL: string;
  multiple?: boolean;
  acceptType?: string;
  buttonTitle: string
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
  onUploadFile?: (response: string) => void;
  onFileUploadError?: (message: string) => void;
  onUploadProgress?: (options: ProgressOptions) => void;
}

export const Uploader = forwardRef<HTMLInputElement, UploaderProps>(({
  uploadURL,
  buttonTitle,
  onUploadStart,
  onUploadComplete,
  onUploadProgress,
  onUploadFile,
  onFileUploadError,
  acceptType = 'image/*',
  multiple = false,
  onClick,
  ...props
}: UploaderProps, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: FileList | [] = e.target.files || [];
    let count = files.length;

    if ((count > 0) && onUploadStart) {
      onUploadStart();
    }

    const checkFinished = () => {
      if ((count <= 0) && onUploadComplete) {
        onUploadComplete();
      }
    };

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(100 * (event.loaded / event.total));
          if (onUploadProgress) {
            onUploadProgress({ file: files[i], percent: percentComplete });
          }
        }
      };

      // eslint-disable-next-line no-multi-assign,@typescript-eslint/no-loop-func
      xhr.onload = xhr.onerror = function (this: XMLHttpRequest,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        event: ProgressEvent<EventTarget>) {
        // eslint-disable-next-line react/no-this-in-sfc
        if (this.status === 200) {
          if (onUploadFile) {
            // eslint-disable-next-line react/no-this-in-sfc
            onUploadFile(this.response);
          }
        } else if (onFileUploadError) {
          // eslint-disable-next-line react/no-this-in-sfc
          onFileUploadError(this.responseText);
        }

        // eslint-disable-next-line no-plusplus
        count--;
        checkFinished();
      };

      // eslint-disable-next-line @typescript-eslint/no-shadow
      xhr.addEventListener('abort', (e) => {
        console.log(e);
      }, false);
      xhr.open('POST', uploadURL);
      xhr.send(formData);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (inputRef && inputRef.current) {
      inputRef.current.click();
    }

    if (onClick) onClick(e);
  };

  return (
    <form method="#" encType="multipart/form-data">
      <input
        ref={assignRef(inputRef, ref)}
        multiple={multiple}
        type="file"
        accept={acceptType}
        hidden
        onChange={handleChange}
      />
      <Button type="button" onClick={handleClick} {...props}>
        {buttonTitle}
      </Button>
    </form>
  );
});
