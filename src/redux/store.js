import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./authSclice";
import attendanceReducer from "./attendanceSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
	auth: authReducer,
	attendance: attendanceReducer,
});

const persistConfig = {
	key: "root",
	storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [
					"persist/PERSIST",
					"persist/REHYDRATE",
					"persist/FLUSH",
					"persist/PAUSE",
					"persist/PURGE",
					"persist/REGISTER",
				],
			},
		}),
});

export const persistor = persistStore(store);
