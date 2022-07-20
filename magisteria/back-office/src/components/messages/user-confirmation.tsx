import React, { useEffect, useMemo, useState } from 'react';
import { render } from 'react-dom';
import { MESSAGE_TYPE } from '#src/constants/messages';
import { PureModalDialog } from './modal-dialog/index';
import type { Message, ModalDialogActions } from '#types/messages';

const DEFAULT_MESSAGE = 'Есть несохраненные данные.\n Перейти без сохранения?';

export interface UserConfirmationProps {
  text?: string;
  callback: (confirm: boolean) => void;
}

export const UserConfirmation = ({ text, callback }: UserConfirmationProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.log('CONFIRM');
    setVisible(true);
  }, [text, callback]);

  const message: Message = useMemo(() => ({
    visible,
    content: text,
    type: MESSAGE_TYPE.CONFIRMATION,
    title: 'Подверждение перехода',
    confirmButtonText: 'Да, хочу!',
    declineButtonText: 'Нет, остаться',
  }), [visible]);

  const actions: ModalDialogActions = {
    confirmAction: () => {
      callback(true);
      setVisible(false);
    },
    declineAction: () => {
      callback(false);
      setVisible(false);
    },
    toggleMessage: () => {
      callback(false);
      setVisible(false);
    },
  };

  return <PureModalDialog message={message} actions={actions} />;
};

export const getConfirmation = (message: string, callback: (confirm: boolean) => void) => {
  render(
    <UserConfirmation text={message || DEFAULT_MESSAGE} callback={callback} />,
    document.getElementById('team-task__prompt-user-confirmation'),
  );
};
