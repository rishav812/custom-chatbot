import { AxiosResponse } from "axios";

export interface StringKeyObject {
  [key: string]: any;
}

export type TApiState = Record<string, any> | null;

export default interface ApiResponse<T = any>
  extends Partial<AxiosResponse<T | TApiState>> {
  data: TApiState;
  error: TApiState;
}
