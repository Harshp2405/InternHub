"use client";
import { useEffect, useState } from "react";
import { getDepartmentsList } from "../../../lib/useAdmin";

export default function DepartmentDashboard() {
	const [departments, setDepartments] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			const data = await getDepartmentsList();
			setDepartments(data);
			setLoading(false);
		};
		loadData();
	}, []);

    // console.log(departments);

	if (loading)
		return <div className="p-10 text-white">Loading Departments...</div>;

	return (
		<div className="p-6 bg-slate-950 min-h-screen text-white">
			<div className="flex justify-between items-end mb-8">
				<div>
					<h2 className="text-2xl font-bold italic text-indigo-400">
						System Organization
					</h2>
					<h1 className="text-4xl font-extrabold tracking-tight">
						Departments
					</h1>
				</div>
				<div className="text-right">
					<span className="text-slate-500 text-sm uppercase tracking-widest">
						Total Entities
					</span>
					<p className="text-2xl font-mono">{departments.length}</p>
				</div>
			</div>

			{/* Department Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{departments.map((dept) => (
					<div
						key={dept.id}
						className="group relative bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all duration-300 shadow-xl">
						{/* Decorative Icon */}
						<div className="absolute top-6 right-6 text-slate-800 group-hover:text-indigo-500/20 text-5xl font-black transition-colors">
							0{dept.id}
						</div>

						<div className="relative z-10">
							<h3 className="text-xl font-bold mb-1 group-hover:text-indigo-400 transition-colors">
								{dept.name}
							</h3>
							<div className="flex items-center gap-2 mb-6">
								<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
								<span className="text-xs text-slate-400 uppercase tracking-tighter">
									Active Department
								</span>
							</div>

							<div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
								<p className="text-slate-500 text-xs font-semibold uppercase mb-1">
									Department Head
								</p>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
										{dept.head_name.charAt(0)}
									</div>
									<p className="text-sm font-medium text-slate-200">
										{dept.head_name}
									</p>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
