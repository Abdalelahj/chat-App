import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiMsg = createApi({
  reducerPath: "MessageApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000",
    responseHandler: async (response) => {
      if (!response.ok) {
        const error = await response.json();
        return { error };
      }
      return response.json();
    },
  }),
  tagTypes: ["Messages"],
  endpoints: (builder) => ({
    getMsgs: builder.query({
      query: ({ senderId, receiverId }) => ({
        url: `messages/${senderId}/${receiverId}`,
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response) => {
        return {
          messages: response.messages,
          conversationId: response.conversationId,
          participants: response.participants,
        };
      },
      providesTags: ["Messages"],
    }),
  }),
});

export const { useGetMsgsQuery } = apiMsg;
