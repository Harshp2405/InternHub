import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	checkIn as checkInAction,
	checkOut as checkOutAction,
} from "../redux/attendanceSlice";

const NavCheckIn = () => {
	const dispatch = useDispatch();
	const [isProcessing, setIsProcessing] = useState(false);

	const { user: authUser } = useSelector((state) => state.auth);
	const { checkIn, checkInTime, times } = useSelector(
		(state) => state.attendance,
	);

	const attedence = async (userId, checkIn, checkOut) => {
		try {
			await fetch("/api/attedence", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId, checkIn, checkOut }),
			});
		} catch (error) {
			console.error("API Error:", error);
		}
	};

	const handleToggle = async () => {
		if (isProcessing) return;
		setIsProcessing(true);

		const now = new Date();
		const formattedNow = now.toLocaleString().split(" ").join("-");

		if (!checkIn) {
			dispatch(checkInAction(formattedNow));
			setIsProcessing(false);
		} else {
			const lastSession = times[times.length - 1];
			dispatch(checkOutAction(formattedNow));
			if (lastSession?.checkIn) {
				await attedence(authUser.id, lastSession.checkIn, formattedNow);
			}
			setIsProcessing(false);
		}
	};

	return (
		<div className="flex items-center gap-4 bg-slate-900/50 border border-slate-700 px-3 py-1.5 rounded-2xl">
			{/* Status & Time Info */}
			<div className="hidden sm:flex flex-col items-end leading-tight">
				<div className="flex items-center gap-2">
					<span
						className={`h-2 w-2 rounded-full ${checkIn ? "bg-green-500 animate-pulse" : "bg-slate-500"}`}
					/>
					<p className="text-[10px] uppercase font-bold tracking-tighter text-slate-400">
						{checkIn ? "Active Shift" : "Offline"}
					</p>
				</div>
				{checkInTime && checkIn && (
					<p className="text-[11px] font-mono text-indigo-400">
						In: {checkInTime.split("-")[1]}
					</p>
				)}
			</div>

			{/* Toggle Button */}
			<button
				onClick={handleToggle}
				disabled={isProcessing}
				className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
					checkIn
						? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
						: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
				} disabled:opacity-50`}>
				{isProcessing ? (
					<div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
				) : (
					<>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-3.5 w-3.5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round">
							<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
							<polyline points="10 17 15 12 10 7" />
							<line x1="15" y1="12" x2="3" y2="12" />
						</svg>
						{checkIn ? "Check Out" : "Check In"}
					</>
				)}
			</button>
		</div>
	);
};

export default NavCheckIn;
