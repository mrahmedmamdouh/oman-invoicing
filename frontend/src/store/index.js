import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authSlice from './slices/authSlice';
import invoicesSlice from './slices/invoicesSlice';
import customersSlice from './slices/customersSlice';
import settingsSlice from './slices/settingsSlice';

const persistConfig = {
  key: 'oman-invoicing',
  storage,
  whitelist: ['auth', 'settings'], // Only persist auth and settings
};

const rootReducer = combineReducers({
  auth: authSlice,
  invoices: invoicesSlice,
  customers: customersSlice,
  settings: settingsSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
