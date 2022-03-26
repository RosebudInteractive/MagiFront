export type UserRoles = Record<string, number>;

export type PData = {
  isAdmin?: boolean;
  roles: UserRoles;
};

export interface IUserData {
  Id: number;
  DisplayName: string;
  Email: string;
  PData: PData;
}

export type Role = {
  Id: number;
  Name: string;
  Code: string;
  ShortCode: string;
  Description: string | null;
  IsBuiltIn: boolean;
};
