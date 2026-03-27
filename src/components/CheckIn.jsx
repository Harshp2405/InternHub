import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
	checkIn as checkInAction,
	checkOut as checkOutAction,
} from "../redux/attendanceSlice";
const CheckIn = () => {
    const dispatch = useDispatch();

    const { user: authUser } = useSelector((state) => state.auth);
		const { checkIn, checkInTime, checkOutTime, times } = useSelector(
			(state) => state.attendance,
		);


    const attedence = async (userId, checkIn, checkOut) => {
			const values = { userId, checkIn, checkOut };
			try {
				const res = await fetch("/api/attedence", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(values),
				});
				const data = await res.json();
			} catch (error) {
				console.log(error, "in attedence");
			}
		};


    const checkInOut = async () => {
            try {
                const now = new Date();
    
                const formattedNow = now.toLocaleString().split(" ").join("-").toString();
    
                if (!checkIn) {
                    dispatch(checkInAction(formattedNow));
                } else {
                    const lastSession = times[times.length - 1];
    
                    dispatch(checkOutAction(formattedNow));
    
                    if (lastSession && lastSession.checkIn) {
                        // ✅ FIX: already formatted string → use directly
                        const formattedCheckIn = lastSession.checkIn;
    
                        await attedence(authUser.id, formattedCheckIn, formattedNow);
                    }
                }
            } catch (error) {
                console.log("Error in checkInOutFun", error);
            }
        };

    return (
			<div>
				{checkInTime && (
					<p className="text-green-400 text-sm">Checked in at: {checkInTime}</p>
				)}

				{checkOutTime && (
					<p className="text-red-400 text-sm">Checked out at: {checkOutTime}</p>
				)}
				<button
					onClick={checkInOut}
					className={`px-6 py-2 rounded-xl font-bold transition-all shadow-lg ${
						checkIn
							? "bg-red-600 hover:bg-red-500 shadow-red-500/20"
							: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
					} text-white`}>
					{checkIn ? "Check Out" : "Check In"}
				</button>
			</div>
		);
}

export default CheckIn