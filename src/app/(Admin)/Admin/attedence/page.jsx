"use client";
import React, { useEffect, useEffectEvent, useState } from "react";

const Attendance = () => {
    const [attedencelist, setAttedencelist] = useState([]);

    const formatTime = (timeStr) => {
        return timeStr.replace(/-/, " ").replace(/-/g, "");
    };

    useEffect(() => {
        const attedenceList = async () => {
            try {
                const res = await fetch(`/api/attedence/list`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json();
                // console.log(data , "Front")
                setAttedencelist(data);
            } catch (error) {
                console.log(error, "in attedence");
            }
        };

        attedenceList();
    }, []);


    return (
			<div>
				<div className="">
					<div className="p-6 bg-gray-50 min-h-screen text-gray-700">
						<div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
							{/* Header Section */}
							<div className="px-6 py-5 border-b border-gray-200 bg-white">
								<h2 className="text-2xl font-bold text-gray-900 tracking-tight">
									Daily Attendance Log
								</h2>
								<div className="flex items-center mt-1">
									<span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
									<p className="text-sm text-gray-500 font-medium">
										{attedencelist.length} Live Records Found
									</p>
								</div>
							</div>

							{/* Table Container */}
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse">
									<thead>
										<tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
											<th className="py-4 px-6 font-semibold">User ID</th>
											<th className="py-4 px-6 font-semibold">Employee</th>
											<th className="py-4 px-6 font-semibold">Department</th>
											<th className="py-4 px-6 font-semibold">Role</th>
											<th className="py-4 px-6 font-semibold text-center">
												Check In
											</th>
											<th className="py-4 px-6 font-semibold text-center">
												Check Out
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100">
										{attedencelist.map((record, key) => (
											<tr
												key={key}
												className="hover:bg-gray-50 transition-all duration-200 group">
												<td className="py-4 px-6">
													<span className="text-gray-400 group-hover:text-blue-600 font-mono transition-colors">
														#{key + 1}
													</span>
												</td>
												<td className="py-4 px-6">
													<div className="flex items-center">
														<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mr-3 shadow-md font-bold">
															{record.user?.name?.charAt(0) || "U"}
														</div>
														<span className="font-medium text-gray-800">
															{record.user?.name || "Unknown"}
														</span>
													</div>
												</td>
												<td className="py-4 px-6">
													<span className="bg-gray-100 border border-gray-200 text-gray-600 py-1 px-3 rounded-md text-xs font-semibold">
														{record.Dept?.department.name || "General"}
													</span>
												</td>
												<td className="py-4 px-6">
													{record.user?.role && (
														<span
															className={`py-1 px-3 rounded-md text-xs font-semibold border ${
																record.user.role === "Admin"
																	? "bg-orange-50 border-orange-200 text-orange-700"
																	: record.user.role === "Intern"
																		? "bg-blue-50 border-blue-200 text-blue-700"
																		: "bg-green-50 border-green-200 text-green-700"
															}`}>
															{record.user.role}
														</span>
													)}
												</td>
												<td className="py-4 px-6 text-center">
													<span className="text-emerald-600 font-mono bg-emerald-50 px-2 py-1 rounded">
														{formatTime(record.checkIn)}
													</span>
												</td>
												<td className="py-4 px-6 text-center">
													<span className="text-rose-600 font-mono bg-rose-50 px-2 py-1 rounded">
														{formatTime(record.checkOut)}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Footer placeholder for pagination or extra info */}
							<div className="px-6 py-4 bg-white border-t border-gray-200 text-right"></div>
						</div>
					</div>
					;
				</div>
			</div>
		);
};

export default Attendance;
