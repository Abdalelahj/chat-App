import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000/user/" }),
    tagTypes: ["Users"],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (userInfo) => ({
                url: 'login',
                method: "POST",
                body: userInfo
            })
        }),
        getUsers: builder.query({
            query: () => "getAll",
            providesTags: (result = []) => [
                'Users',
                ...result.map(({ _id }) => ({ type: 'Users', _id })),
            ],
        }),
        createUser: builder.mutation({
            query: (newUser) => ({
                url: 'create-users',
                method: "POST",
                body: newUser
            })
        })
    })
})


export const { useLoginMutation ,useGetUsersQuery, useCreateUserMutation} = apiSlice