import axios, { AxiosResponse } from "axios";

import { withData, withError } from "./api";

export const http = axios.create({
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use(async (req: any) => {
  return req;
});

http.interceptors.response.use(
  (res) => withData(res.data) as any,
  (err) => withError(err.response?.data)
);

export function get<P>(url: string, params?: P): Promise<any> {
  return http({
    method: "get",
    url,
    params,
  });
}

export function post<D, P>(url: string, data: D, params?: P): any {
  return http({
    method: "post",
    url,
    data,
    params,
  });
}

export function postFile<D, P>(url: string, data: D, params?: P): any {
  return http({
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    url,
    data,
    params,
  });
}

export function put<D, P>(url: string, data: D, params?: P): any {
  return http({
    method: "put",
    url,
    data,
    params,
  });
}

export function patch<D, P>(url: string, data: D, params?: P): any {
  return http({
    method: "patch",
    url,
    data,
    params,
  });
}

export function remove<P>(url: string, params?: P): any {
  return http({
    method: "delete",
    url,
    params,
  });
}
