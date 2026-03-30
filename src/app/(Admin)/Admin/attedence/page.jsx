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
                <div className="p-6 bg-[#0f172a] min-h-screen text-slate-200">
                    <div className="max-w-6xl mx-auto bg-[#1e293b] shadow-2xl rounded-xl border border-slate-700 overflow-hidden">
                        {/* Header Section */}
                        <div className="px-6 py-5 border-b border-slate-700 bg-[#1e293b]">
                            <h2 className="text-2xl font-bold text-white tracking-tight">
                                Daily Attendance Log
                            </h2>
                            <div className="flex items-center mt-1">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                                <p className="text-sm text-slate-400 font-medium">
                                    {attedencelist.length} Live Records Found
                                </p>
                            </div>
                        </div>

                        {/* Table Container */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#334155] text-slate-300 uppercase text-xs tracking-wider">
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
                                <tbody className="divide-y divide-slate-700">
                                    {attedencelist.map((record, key) => (
                                        <tr
                                            key={key}
                                            className="hover:bg-[#334155]/50 transition-all duration-200 group">
                                            <td className="py-4 px-6">
                                                <span className="text-slate-500 group-hover:text-blue-400 font-mono transition-colors">
                                                    #{key + 1}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mr-3 shadow-lg font-bold">
                                                        {record.user?.name?.charAt(0) || "U"}
                                                    </div>
                                                    <span className="font-medium text-slate-200">
                                                        {record.user?.name || "Unknown"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="bg-slate-700/50 border border-slate-600 text-slate-300 py-1 px-3 rounded-md text-xs font-semibold">
                                                    {record.user?.DeptName?.name || "General"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {record.user?.role && (
                                                    <span
                                                        className={`py-1 px-3 rounded-md text-xs font-semibold border ${record.user.role === "Admin"
                                                                ? "bg-orange-600/50 border-orange-500 text-orange-200"
                                                                : record.user.role === "Intern"
                                                                ? "bg-blue-900/30 border-blue-800 text-blue-200"
                                                                : "bg-green-800 border-green-700 text-green-400"
                                                            }`}>
                                                        {record.user.role}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="text-emerald-400 font-mono bg-emerald-400/10 px-2 py-1 rounded">
                                                    {formatTime(record.checkIn)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="text-rose-400 font-mono bg-rose-400/10 px-2 py-1 rounded">
                                                    {formatTime(record.checkOut)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer placeholder for pagination or extra info */}
                        <div className="px-6 py-4 bg-[#1e293b] border-t border-slate-700 text-right"></div>
                    </div>
                </div>
                ;
            </div>
        </div>
    );
};

export default Attendance;
