export interface UserLogin {
  userInfo: {
    account: string;
    nickName: string;
    email: string;
    phone: string;
    sex: string;
    avatar: string;
    id: string;
    sort: number;
    status: number;
    platform?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
  token_type: string;
  access_token: string;
  refresh_token: string;
}
/** 刷新token */
export interface RefreshToken {
  access_token: string;
  token_type: string;
}
