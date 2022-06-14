export declare type UserRoles = Record<string, number>;
export declare type PData = {
    isAdmin?: boolean;
    roles: UserRoles;
};
export interface IUserData {
    Id: number;
    DisplayName: string;
    Email: string;
    PData: PData;
}
export declare type Role = {
    Id: number;
    Name: string;
    Code: string;
    ShortCode: string;
    Description: string | null;
    IsBuiltIn: boolean;
};
//# sourceMappingURL=user.d.ts.map