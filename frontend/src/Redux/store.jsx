import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./Features/authSlice"
import { apiSlice } from "./Features/api/apiSlice";
import chatSlice from "./Features/chat/Chat-Slice"
import {apiMsg} from "./Features/api/MsgsSlice"
const store = configureStore({
    reducer: {
      auth: authSlice,
      chat: chatSlice,
      [apiSlice.reducerPath]: apiSlice.reducer,
      [apiMsg.reducerPath]: apiMsg.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(apiSlice.middleware)  
        .concat(apiMsg.middleware)    
  });

export default store;