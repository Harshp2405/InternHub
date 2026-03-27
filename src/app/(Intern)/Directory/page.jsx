"use client";
import React, { useEffect, useState } from "react";

export default function InternDirectory() {
	const [interns, setInterns] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	// ✅ Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const internsPerPage = 18;

	useEffect(() => {
		fetch("/api/interns/all")
			.then((res) => res.json())
			.then((data) => {
				if (Array.isArray(data)) {
					setInterns(data);
				} else {
					console.error("API Error:", data.error);
					setInterns([]);
				}
				setLoading(false);
			})
			.catch((err) => {
				console.error("Fetch Error:", err);
				setInterns([]);
				setLoading(false);
			});
	}, []);

	// ✅ Filter
	const filteredInterns = Array.isArray(interns)
		? interns.filter(
				(i) =>
					i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					i.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					i.DeptName?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
			)
		: [];

	// ✅ Pagination logic
	const indexOfLast = currentPage * internsPerPage;
	const indexOfFirst = indexOfLast - internsPerPage;
	const currentInterns = filteredInterns.slice(indexOfFirst, indexOfLast);
	const totalPages = Math.ceil(filteredInterns.length / internsPerPage);

	if (loading)
		return (
			<div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
				<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
			</div>
		);

	return (
		<div className="min-h-screen bg-[#0f172a] p-8 text-slate-200">
			<div className="max-w-6xl mx-auto">
				<div className="mb-8 border-l-4 border-indigo-500 pl-4">
					<h1 className="text-3xl font-bold text-white">
						Intern <span className="text-indigo-400">Community</span>
					</h1>
					<p className="text-slate-400">
						Network with peers across all departments.
					</p>
				</div>

				{/* Search Bar */}
				<div className="mb-8 relative">
					<input
						type="text"
						placeholder="Search by name, college, or department..."
						className="w-full bg-[#1e293b] border border-slate-800 rounded-xl p-4 pl-12 text-white focus:border-indigo-500 outline-none transition-all"
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setCurrentPage(1); 
						}}
					/>
					<span className="absolute left-4 top-4 text-slate-500">🔍</span>
				</div>

				{/* Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{currentInterns.map((intern) => (
						<div
							key={intern.id}
							className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-all group relative overflow-hidden">
							{/* Gender Tag */}
							<div className="absolute top-4 right-4">
								<span
									className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
										intern.gender?.toLowerCase() === "male"
											? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
											: intern.gender?.toLowerCase() === "female"
												? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
												: "bg-slate-700/30 text-slate-400 border border-slate-700"
									}`}>
									{intern.gender || "N/A"}
								</span>
							</div>

							<div className="flex items-center gap-4 mb-4">
								<div className="h-14 w-14 rounded-full bg-[#0f172a] border border-slate-700 flex items-center justify-center text-xl font-bold text-indigo-400">
									{intern.name?.charAt(0)}
								</div>
								<div>
									<h3 className="text-white font-bold text-lg leading-tight">
										{intern.name}
									</h3>
									<p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">
										{intern.college || "Independent"}
									</p>
								</div>
							</div>

							<div className="space-y-3 pt-4 border-t border-slate-800/50">
								<div className="flex items-center gap-2">
									<span className="text-slate-500 text-xs font-bold uppercase w-12">
										Dept:
									</span>
									<span className="text-slate-300 text-sm font-medium">
										{intern.department_name ||
											intern.DeptName?.name ||
											"General"}
									</span>
								</div>

								<div className="flex items-center gap-2">
									<span className="text-slate-500 text-xs font-bold uppercase w-12">
										Email:
									</span>
									<span className="text-slate-300 text-sm truncate">
										{intern.email}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
						<button
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
							className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-40">
							Prev
						</button>

						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<button
								key={page}
								onClick={() => setCurrentPage(page)}
								className={`px-4 py-2 rounded-lg ${
									currentPage === page
										? "bg-indigo-500 text-white"
										: "bg-slate-800 text-slate-300"
								}`}>
								{page}
							</button>
						))}

						<button
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, totalPages))
							}
							disabled={currentPage === totalPages}
							className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-40">
							Next
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
