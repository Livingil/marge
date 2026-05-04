import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type GridCell = {
  itemLevel: number;
};

export type UserState = {
  _id: string;
  gold: number;
  baseLevel: number;
  grid: {
    cells: GridCell[];
  };
};

export type MergePayload = {
  cellA: number;
  cellB: number;
};

export const gameApi = createApi({
  reducerPath: "gameApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000" }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUser: builder.query<UserState, void>({
      query: () => "/user",
      providesTags: ["User"]
    }),
    mergeCells: builder.mutation<UserState, MergePayload>({
      query: (body) => ({
        url: "/merge",
        method: "POST",
        body
      }),
      invalidatesTags: ["User"]
    }),
    upgradeBase: builder.mutation<UserState, void>({
      query: () => ({
        url: "/upgrade/base",
        method: "POST"
      }),
      invalidatesTags: ["User"]
    })
  })
});

export const { useGetUserQuery, useMergeCellsMutation, useUpgradeBaseMutation } = gameApi;
