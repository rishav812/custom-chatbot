import React, { useCallback, useState } from "react";
import ApiResponse from "../../resources/domain/entity/IApiResponse";

export interface IUseInfiniteScrollParams {
  apiService: (params: any) => Promise<ApiResponse>;
  apiParams?: { [key: string]: unknown };
  limit?: number;
}

export const useInfiniteScroll = ({
  apiService,
  limit = 10,
  apiParams,
}: IUseInfiniteScrollParams): any => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(
    async ({ firstLoad = false }: { firstLoad?: boolean }) => {
      if (firstLoad) {
      }
      setLoading(true);
      const res = await apiService({
        ...apiParams,
      });
      console.log("res from commonhook====>", res);
      if (res?.data) {
        const info = res?.data.data;
        console.log("info===>", Object.values(info), info);
        setData(info);
      } else {
      }
      setLoading(false);
    },
    []
  );
  return { fetchData, loading, data };
};
