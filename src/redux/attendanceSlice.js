// attendanceSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
	checkIn: false, 
	checkInTime: null, 
	checkOutTime: null, 
	times: [],
};

const attendanceSlice = createSlice({
	name: "attendance",
	initialState,
	reducers: {
		// Action to check in
		checkIn: (state, action) => {
			const now = action.payload; // Date object
			state.checkIn = true;
			state.checkInTime = now;
			state.checkOutTime = null;
			state.times.push({ checkIn: now, checkOut: null });
		},

		// Action to check out
		checkOut: (state, action) => {
			const now = action.payload; // Date object
			state.checkIn = false;
			state.checkOutTime = now;

			if (state.times.length > 0) {
				state.times[state.times.length - 1].checkOut = now;
			}
		},

		resetAttendance: () => initialState,
	},
});

export const { checkIn, checkOut, resetAttendance } = attendanceSlice.actions;

export default attendanceSlice.reducer;
