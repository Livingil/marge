import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type GridItem = {
  level: number;
  name: string;
  description: string;
  icon: string;
};

export type GridCell = {
  itemLevel: number;
  item: GridItem | null;
};

export type UserState = {
  _id: string;
  gold: number;
  baseLevel: number;
  incomePerMinute: number;
  lastIncomeClaimAt: string;
  spawnCost: number;
  baseUpgradeCost: number;
  goal: {
    title: string;
    rewardGold: number;
  };
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
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3001" }),
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
    spawnItem: builder.mutation<UserState, void>({
      query: () => ({
        url: "/spawn",
        method: "POST"
      }),
      invalidatesTags: ["User"]
    }),
    claimIncome: builder.mutation<UserState, void>({
      query: () => ({
        url: "/income/claim",
        method: "POST"
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

export const {
  useGetUserQuery,
  useMergeCellsMutation,
  useSpawnItemMutation,
  useClaimIncomeMutation,
  useUpgradeBaseMutation
} = gameApi;
