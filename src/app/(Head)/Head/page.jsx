"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { getDeptName } from "../../lib/useAdmin";
import { sendMail } from "../../lib/send-mail";

function DashboardContent() {
    const searchParams = useSearchParams();
    const externalSearch = searchParams.get('search');

    const { user } = useSelector((state) => state.auth);
    const [interns, setInterns] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [genderFilter, setGenderFilter] = useState("All");
    const [departmentName, setDepartmentName] = useState("");

	const [atte, setAtte] = useState(false);
	const [attedencelist, setAttedencelist] = useState([]);
	

    const router = useRouter();

    useEffect(() => {
			const dname = async ()=>{
                const deptname = await getDeptName(user?.dept_id);
				setDepartmentName(deptname[0].name);
            }
            dname();
		}, [user?.department_id]);

    

    // Initialize searchTerm from URL on mount
    useEffect(() => {
        if (externalSearch) {
            setSearchTerm(externalSearch);
        }
    }, [externalSearch]);

    // Fetch Interns Data
    useEffect(() => {
        const deptId = user?.dept_id || user?.department_id;
        if (deptId) {
            fetch(`/api/head/interns?deptId=${deptId}`)
                .then(res => res.json())
                .then(data => setInterns(data));
        }
    }, [user]);

    const filteredInterns = interns.filter((intern) => {
        const matchesSearch = 
            (intern.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
            (intern.college || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGender = genderFilter === "All" || intern.gender === genderFilter;
        return matchesSearch && matchesGender;
    });


	const attedenceList = async () => {
		try {
			const res = await fetch(`/api/attedence/list/${user.id}`, {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();
			setAttedencelist(data);
		} catch (error) {
			console.log(error, "in attedence");
		}
	};
	const deptattedenceList = async () => {
		try {
			const res = await fetch(`/api/attedence/list/department/${user.dept_id}`, {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();
			setAttedencelist(data);
		} catch (error) {
			console.log(error, "in attedence");
		}
	};

	const formatTime = (timeStr) => {
		return timeStr.replace(/-/, " ").replace(/-/g, "");
	};

    return (
			<div className="p-8 bg-gray-50 min-h-screen text-gray-700">
				<div className="max-w-6xl mx-auto">
					{/* Header Section */}
					<div className="mb-8 border-l-4 border-indigo-500 pl-4 flex justify-between items-end">
						<div>
							<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
								{departmentName} Department{" "}
								<span className="text-indigo-600">Interns</span>
							</h1>
							<p className="text-gray-500 mt-1">
								Real-time management for your assigned personnel.
							</p>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<button
								onClick={() => {
									setAtte((prev) => !prev);
									attedenceList();
								}}
								className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20">
								My Attedence
							</button>
							<button
								onClick={() => {
									setAtte((prev) => !prev);
									deptattedenceList();
								}}
								className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20">
								Intern Attedence
							</button>
							
						</div>

						{searchTerm && (
							<button
								onClick={() => {
									setSearchTerm("");
									router.replace("/Head/dashboard");
								}}
								className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 py-1 px-3 rounded-lg transition-colors border border-gray-200">
								Clear Search ✕
							</button>
						)}
					</div>

					{/* Search & Filter Bar */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
						<div className="md:col-span-3 relative">
							<input
								type="text"
								placeholder="Search by name or college..."
								className="w-full bg-white border border-gray-200 rounded-xl p-4 pl-12 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<span className="absolute left-4 top-4 text-gray-400">🔍</span>
						</div>

						<select
							className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-indigo-500 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
							value={genderFilter}
							onChange={(e) => setGenderFilter(e.target.value)}>
							<option value="All">All Genders</option>
							<option value="MALE">Male</option>
							<option value="FEMALE">Female</option>
							<option value="OTHER">Other</option>
						</select>
					</div>

					{/* User Attedence Modal */}

					{atte && (
						<div className="">
							<div className="p-6 bg-gray-50 min-h-screen text-gray-700">
								<div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
									{/* Header Section */}
									<div className="relative px-6 py-5 border-b border-gray-200 bg-white">
										{/* Close Button */}
										<button
											type="button"
											className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors p-2"
											onClick={() => setAtte((prev) => !prev)}>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-6 w-6"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>

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
												<tr className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
													<th className="py-4 px-6 font-semibold">User ID</th>
													<th className="py-4 px-6 font-semibold">Employee</th>
													
													<th className="py-4 px-6 font-semibold text-center">
														Check In
													</th>
													<th className="py-4 px-6 font-semibold text-center">
														Check Out
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-200">
												{attedencelist.map((record, key) => (
													<tr
														key={key}
														className="hover:bg-gray-100/50 transition-all duration-200 group">
														<td className="py-4 px-6">
															<span className="text-gray-400 group-hover:text-blue-600 font-mono transition-colors">
																#{key + 1}
															</span>
														</td>
														<td className="py-4 px-6">
															<div className="flex items-center">
																<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mr-3 shadow-lg font-bold">
																	{record.user?.name?.charAt(0) || "U"}
																</div>
																<span className="font-medium text-gray-700">
																	{record.user?.name || "Unknown"}
																</span>
															</div>
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
					)}

					{/* Table Container */}
					<div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-lg">
						<table className="w-full text-left">
							<thead>
								<tr className="bg-gray-100/50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-200">
									<th className="px-6 py-5 font-semibold">Intern Details</th>
									<th className="px-6 py-5 font-semibold">College</th>
									<th className="px-6 py-5 font-semibold text-center">
										Gender
									</th>
									<th className="px-6 py-5 font-semibold text-center">
										Action
									</th>
									<th className="px-6 py-5 font-semibold text-center">
										Tasks Count
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{filteredInterns.length > 0 ? (
									filteredInterns.map((intern) => (
										<tr
											key={intern.id}
											className="hover:bg-gray-50 transition-all group">
											<td className="px-6 py-5">
												<div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
													{intern.name}
												</div>
												<div className="text-sm text-gray-400">
													{intern.email}
												</div>
											</td>
											<td className="px-6 py-5">
												<span className="text-gray-600 text-sm italic">
													{intern.college || "Unspecified"}
												</span>
											</td>
											<td className="px-6 py-5 text-center">
												<span
													className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter border ${
														intern.gender.toLowerCase() === "male"
															? "bg-blue-50 text-blue-600 border-blue-200"
															: intern.gender.toLowerCase() === "female"
																? "bg-pink-50 text-pink-600 border-pink-500/20"
																: "bg-gray-200 text-gray-600 border-gray-300"
													}`}>
													<span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"></span>
													{intern.gender || "N/A"}
												</span>
											</td>
											<td className="px-6 py-5 text-center">
												<div className="flex items-center justify-center gap-3">
													<button
														onClick={() => router.push(`/${intern.id}/view`)}
														className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-[80px]">
														View
													</button>
													<button
														onClick={() =>
															router.push(
																`/Head/tasks?search=${encodeURIComponent(intern.name)}`,
															)
														}
														className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-[100px]">
														Edit Task
													</button>
												</div>
											</td>
											<td className="px-6 py-5 text-center">
												<div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold text-sm">
													{intern.task_count || 0}
												</div>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan="5" className="px-6 py-20 text-center">
											<div className="text-gray-400 text-lg">
												No matches found for &quot;
												<span className="text-indigo-600">{searchTerm}</span>
												&quot;
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Footer Stats */}
					<div className="mt-6 flex justify-between items-center text-sm text-gray-400 px-2">
						<p>
							Showing {filteredInterns.length} out of {interns.length} interns
						</p>
						<div className="flex gap-2">
							<span className="flex items-center gap-1">
								<span className="h-2 w-2 rounded-full bg-blue-400"></span> Male
							</span>
							<span className="flex items-center gap-1">
								<span className="h-2 w-2 rounded-full bg-pink-400"></span>{" "}
								Female
							</span>
						</div>
					</div>
				</div>
			</div>
		);
}

export default function HeadDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 text-gray-700 p-8">Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}