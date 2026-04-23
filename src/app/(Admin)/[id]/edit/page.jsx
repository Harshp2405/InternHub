"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	getSingleUser,
	updateUser,
	getDepartments,
	getUpdateDepartments,
} from "../../../lib/useAdmin";

export default function EditUser() {
	const { id } = useParams();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [departments, setDepartments] = useState([]);
	const [notheaddepartments, setNotHeadDepartments] = useState([]);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		role: "",
		college: "",
		gender: "",
		department_id: "",
	});

	useEffect(() => {
		const loadData = async () => {
			try {
				const [user, depts, nonHead] = await Promise.all([
					getSingleUser(id),
					getDepartments(),
					getUpdateDepartments(),
				]);

				if (user) {
					setFormData({
						name: user.name || "",
						email: user.email || "",
						role: user.role || "",
						college: user.college || "",
						gender: user.gender || "",
						department_id: user.department_id
							? String(user.department_id)
							: "",
					});
				}
				setDepartments(depts);
				setNotHeadDepartments(nonHead);
			} catch (error) {
				console.error("Error loading user data:", error);
				alert("Could not load user data");
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [id]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await updateUser(id, {
				name: formData.name,
				email: formData.email,
				role: formData.role,
				college: formData.role === "Head" ? null : formData.college,
				gender: formData.gender,
				department_id: parseInt(formData.department_id),
			});
			alert("User updated successfully!");
			router.push("/Admin");
		} catch (error) {
			alert("Update failed: " + error.message);
		}
	};

	if (loading)
		return (
			<div className="p-10 text-gray-900 text-center font-bold">
				Loading User Data...
			</div>
		);

	return (
		<div className="min-h-screen p-8 text-gray-900 flex justify-center items-start bg-gray-50">
			<div className="w-full max-w-3xl bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
				<h1 className="text-3xl font-bold mb-8 text-blue-600 border-b border-gray-200 pb-4">
					Edit User Profile
				</h1>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">
								Full Name
							</label>
							<input
								type="text"
								className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">
								Email
							</label>
							<input
								type="email"
								className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">
								Role
							</label>
							<select
								className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
								value={formData.role}
								onChange={(e) =>
									setFormData({ ...formData, role: e.target.value })
								}>
								<option value="Intern">Intern</option>
								<option value="Head">Head</option>
								<option value="Admin">Admin</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">
								Department
							</label>
							<select
								className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
								value={formData.department_id}
								onChange={(e) =>
									setFormData({ ...formData, department_id: e.target.value })
								}>
								<option value="">Select Department</option>
								{(formData.role === "Head"
									? notheaddepartments
									: departments
								).map((dept) => (
									<option key={dept.id} value={String(dept.id)}>
										{dept.name}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">
								Gender
							</label>
							<select
								className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
								value={formData.gender}
								onChange={(e) =>
									setFormData({ ...formData, gender: e.target.value })
								}>
								<option value="MALE">MALE</option>
								<option value="FEMALE">FEMALE</option>
								<option value="OTHER">OTHER</option>
							</select>
						</div>
					</div>

					{/* Conditional rendering: Only show College if role is NOT Head */}
					{formData.role !== "Head" && (
						<div className="animate-in fade-in duration-300">
							<label className="block text-sm font-medium text-gray-400 mb-2">
								College
							</label>
							<input
								type="text"
								className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
								value={formData.college}
								onChange={(e) =>
									setFormData({ ...formData, college: e.target.value })
								}
								placeholder="Enter college name"
							/>
						</div>
					)}

					<div className="flex justify-end gap-4 pt-8 border-t border-gray-200 mt-4">
						<button
							type="button"
							onClick={() => router.back()}
							className="px-8 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">
							Cancel
						</button>
						<button
							type="submit"
							className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all font-bold shadow-lg shadow-blue-900/20">
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
