import { Scheme, Role } from '../@types/permissions';

export const scheme: Scheme = {
  dsb: {
    alias: 'dashboard',
    type: 'group',
    title: 'Панель управления издательским планом.',
    items: {
      al: {
        alias: 'accessLevel',
        type: 'item',
        title: 'Уровень доступа',
        dataType: 'enum',
        mergeType: 'max',
        values: {
          0: 'Нет доступа',
          1: 'Просмотр',
          2: 'Просмотр и редактирование',
          3: 'Полный',
        },
        default: 0,
      },
    },
  },
  tml: {
    alias: 'timeline',
    type: 'group',
    title: 'Доступ к таймлайнам.',
    items: {
      al: {
        alias: 'accessLevel',
        type: 'item',
        title: 'Уровень доступа',
        dataType: 'enum',
        mergeType: 'max',
        values: {
          0: 'Нет доступа',
          1: 'Просмотр',
          2: 'Просмотр и редактирование',
          3: 'Полный',
        },
        default: 0,
      },
    },
  },
  ttp: {
    alias: 'task_type',
    type: 'group',
    title: 'Доступ к типам задач.',
    items: {
      al: {
        alias: 'accessLevel',
        type: 'item',
        title: 'Уровень доступа',
        dataType: 'enum',
        mergeType: 'max',
        values: {
          0: 'Нет доступа',
          1: 'Просмотр',
          2: 'Просмотр и редактирование',
          3: 'Полный',
        },
        default: 0,
      },
    },
  },
  usr: {
    alias: 'user',
    type: 'group',
    title: 'Доступ к пользователям.',
    items: {
      al: {
        alias: 'accessLevel',
        type: 'item',
        title: 'Уровень доступа',
        dataType: 'enum',
        mergeType: 'max',
        values: {
          0: 'Нет доступа',
          1: 'Просмотр',
          2: 'Просмотр и редактирование',
          3: 'Полный',
        },
        default: 0,
      },
    },
  },
  rle: {
    alias: 'role',
    type: 'group',
    title: 'Доступ к ролям пользователей.',
    items: {
      al: {
        alias: 'accessLevel',
        type: 'item',
        title: 'Уровень доступа',
        dataType: 'enum',
        mergeType: 'max',
        values: {
          0: 'Нет доступа',
          1: 'Просмотр',
          2: 'Просмотр и редактирование',
          3: 'Полный',
        },
        default: 0,
      },
    },
  },
};

export const roleWithDsbFullAccess: Role = {
  id: 5,
  code: 'PMADM',
  name: 'Администратор процессов',
  shortCode: 'pma',
  description: 'Администрирование всех процессов в системе.',
  isBuiltIn: false,
  permissions: {
    dsb: {
      al: 3,
    },
    tml: {
      al: 3,
    },
    ttp: {
      al: 3,
    },
    usr: {
      al: 3,
    },
    rle: {
      al: 3,
    },
  },
};
