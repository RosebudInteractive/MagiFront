import { MESSAGE_TYPE } from '../constants/messages';

type ValueOf<T> = T[keyof T];

export type Message = {
  title: string,
  content?: string,
  visible?: boolean,
  type?: ValueOf<typeof MESSAGE_TYPE>,
  declineButtonText?: string,
  confirmButtonText?: string,
};

export type ModalDialogActions = {
  declineAction: Function,
  confirmAction?: Function,
  closeAction?: Function,
  toggleMessage?: Function,
};
//
// export type ModalDialogProps = {
//   message: Message,
//   actions: ModalDialogActions,
// };
