"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const IdDept = () => {
	const { id } = useParams();
	const router = useRouter();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(`/api/head/departmentdetails/${id}`);
				if (!response.ok) throw new Error(`Error: ${response.status}`);
				const result = await response.json();
                console.log(result)
                setData(result);
			} catch (error) {
				console.error("Fetch error:", error.message);
			} finally {
				setLoading(false);
			}
		};
		if (id) fetchData();
	}, [id]);

    const handleDelete = async () => {
			if (
				!confirm(
					"Are you sure? All staff will be unassigned and the head will become an Intern.",
				)
			) {
				return;
			}

			setIsDeleting(true);

			try {

				const res = await fetch(`/api/head/departmentdetails/${id}`, {
					method: "DELETE",
				});

				const contentType = res.headers.get("content-type");
				if (
					!res.ok ||
					!contentType ||
					!contentType.includes("application/json")
				) {
					const errorText = await res.text();
					throw new Error(
						`Server returned ${res.status}: ${errorText.substring(0, 100)}`,
					);
				}
				const result = await res.json();
				alert("Department deleted successfully");
				router.push("/Admin");
				router.refresh();
			} catch (error) {
				console.error("Delete failed:", error);
				alert(`Delete failed: ${error.message}`);
			} finally {
				setIsDeleting(false);
			}
		};

	if (loading)
		return (
			<div className="p-10 text-gray-900 animate-pulse">
				Loading Department Details...
			</div>
		);
	if (!data?.departments_by_pk)
		return <div className="p-10 text-red-600">Department not found.</div>;

	const dept = data.departments_by_pk;
	const users = data.users || [];

	// Simple Stats Logic
	const maleCount = users.filter((u) =>["MALE", "Male"].includes(u.gender)).length;
	const femaleCount = users.filter((u) =>["FEMALE", "Female"].includes(u.gender)).length;

	return (
		<div className="min-h-screen bg-gray-50 text-gray-700 p-6 md:p-12">
			{/* Header / Breadcrumb */}
			<button
				onClick={() => router.back()}
				className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors mb-6 text-sm font-medium">
				← Back to Dashboard
			</button>

			{/* Department Hero Section */}
			<div className="bg-white border border-gray-200 rounded-3xl p-8 mb-8 shadow-lg relative overflow-hidden flex flex-row">
				<div className="absolute top-0 right-0 p-8 text-gray-200 font-black text-7xl opacity-20 pointer-events-none">
					{dept.id}
				</div>

				<div className="relative z-10">
					<span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200 uppercase tracking-widest">
						Department
					</span>
					<h1 className="text-5xl font-extrabold text-gray-900 mt-4 mb-2 tracking-tight">
						{dept.name}
					</h1>
					<div className="flex flex-wrap gap-6 mt-6">
						<StatItem label="Total Staff" value={users.length} />
						<StatItem label="Male" value={maleCount} color="text-blue-600" />
						<StatItem
							label="Female"
							value={femaleCount}
							color="text-pink-600"
						/>
					</div>
				</div>

				<div className="relative z-10">
					<button
						onClick={handleDelete}
						disabled={isDeleting}
						className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
							isDeleting
								? "bg-gray-100 text-gray-400 cursor-not-allowed"
								: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white shadow-md shadow-red-500/10"
						}`}>
						{isDeleting ? (
							<>
								<span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
								Deleting...
							</>
						) : (
							"Delete Department"
						)}
					</button>
				</div>
			</div>

			{/* Users List Section */}
			<div className="space-y-4">
				<div className="flex justify-between items-center px-2">
					<h2 className="text-xl font-bold text-gray-900">Team Members</h2>
					<span className="text-sm text-gray-400">
						{users.length} active profiles
					</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{users.map((user) => (
						<div
							key={user.id}
							className="bg-white border border-gray-200 hover:border-indigo-500/40 p-5 rounded-2xl transition-all group">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-4">
									<div
										className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
											user.gender === "MALE"
												? "bg-blue-50 text-blue-600"
												: "bg-pink-50 text-pink-600"
										}`}>
										{user.name.charAt(0)}
									</div>
									<div>
										<h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
											{user.name}
										</h3>
										<p className="text-xs text-gray-400">{user.email}</p>
									</div>
								</div>
								<Link href={`/${user.id}/edit`}>
									<span
										className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
											user.role === "Head"
												? "border-amber-300 text-amber-700 bg-amber-50"
												: "border-gray-200 text-gray-500"
										}`}>
										{user.role}
									</span>
								</Link>
							</div>

							<div className="mt-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter text-gray-500">
								<span>
									Gender:{" "}
									<span
										className={
											user.gender === "MALE" ? "text-blue-600" : "text-pink-600"
										}>
										{user.gender}
									</span>
								</span>
								<span>ID: #{user.id}</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};


const StatItem = ({ label, value, color = "text-indigo-600" }) => (
	<div className="flex flex-col border-l-2 border-gray-200 pl-4">
		<span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
			{label}
		</span>
		<span className={`text-2xl font-mono font-bold ${color}`}>{value}</span>
	</div>
);

export default IdDept;
