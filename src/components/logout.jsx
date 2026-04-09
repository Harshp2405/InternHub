"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { logout } from "../redux/authSclice";
import {
	resetAttendance,
	checkOut as checkOutAction,
} from "../redux/attendanceSlice";

export default function LogoutButton() {
	const dispatch = useDispatch();
	const router = useRouter();

	const { checkIn, times } = useSelector((state) => state.attendance);
	const { user: authUser } = useSelector((state) => state.auth);


	const attedence = async (userId, checkInTime, checkOutTime) => {
		try {
			await fetch("/api/attedence", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId,
					checkIn: checkInTime,
					checkOut: checkOutTime,
				}),
			});
		} catch (error) {
			console.error("API Error:", error);
		}
	};

	const handleLogout = async () => {
		try {
			if (checkIn) {
				const now = new Date();
				const formattedNow = now.toLocaleString().split(" ").join("-");

				const lastSession = times[times.length - 1];

				dispatch(checkOutAction(formattedNow));

				if (lastSession?.checkIn) {
					await attedence(authUser.id, lastSession.checkIn, formattedNow);
				}
			}

			await signOut({ redirect: false });

			dispatch(resetAttendance());
			dispatch(logout());

			router.push("/Login");
			router.refresh();
		} catch (error) {
			console.error("Logout failed", error);
		}
	};

	return (
		<button
			onClick={handleLogout}
			className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all">
			Logout
		</button>
	);
}
