import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type GridItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
};

export type GridCell = {
  itemId: string | null;
  item: GridItem | null;
};

export type DiscoveredRecipeDto = {
  key: string;
  left: GridItem;
  right: GridItem;
  result: GridItem;
};

export type UserState = {
  _id: string;
  gold: number;
  baseLevel: number;
  incomePerMinute: number;
  lastIncomeClaimAt: string;
  spawnCost: number;
  baseUpgradeCost: number;
  currentGoal: {
    title: string;
    targetItemId: string;
    rewardText: string;
  };
  discoveredItems: string[];
  discoveredRecipes: string[];
  discoveredRecipeDetails: DiscoveredRecipeDto[];
  itemCatalog: GridItem[];
  deleteCosts: Array<number | null>;
  latestDiscovery: GridItem | null;
  lastActionMessage: string | null;
  grid: {
    cells: GridCell[];
  };
};

export type MergePayload = {
  cellA: number;
  cellB: number;
};

export type DeleteCellPayload = {
  cellIndex: number;
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
    }),
    deleteCell: builder.mutation<UserState, DeleteCellPayload>({
      query: (body) => ({
        url: "/cell/delete",
        method: "POST",
        body
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
  useUpgradeBaseMutation,
  useDeleteCellMutation
} = gameApi;
