"use client";

import { useEffect, useState } from "react";
import { userlist, updateUser, deleteUser, getDepartments } from "../../lib/useAdmin"; // Added getDepartments
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { getSessionUser } from "../../lib/useAuth";
import Link from "next/link";
import { useIdleTimeout } from "../../../hooks/useIdleTimeout";
import { useFormik } from "formik";
import Image from "next/image";
import { toast } from "react-toastify";

export default function Admin() {
    const [users, setUsers] = useState([]);
	
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [deptFilter, setDeptFilter] = useState("All");
	const [profileImage, setProfileImage] = useState(null);
    const router = useRouter();
	
    const currentUser = useSelector((state) => state.auth.user);
    // console.log(currentUser);

    useEffect(() => {
        const fetchData = async () => {
					const userData = await userlist();
					const deptData = await getDepartments(); 
					setUsers(userData);
					setDepartments(deptData);
				};
        fetchData();
    }, []);

    const handleRoleChange = async (id, newRole) => {
        try {
            await updateUser(id, { role: newRole });
            await fetchUsers(); 
        } catch (error) {
            alert("Failed to update role");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(id);
                setUsers(users.filter((u) => u.id !== id));
            } catch (error) {
                alert("Failed to delete user");
            }
        }
    };



	// Image Upload
	const formik = useFormik({
		initialValues: {
			profile_Image: "",
			user_id: parseInt(currentUser.id),
		},
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				const formData = new FormData();
				formData.append("file", values.profile_Image);
				formData.append("user_id", values.user_id);

				console.log(values , "Values");

				const res = await fetch("/api/imageUpload", {
					method: "POST",
					body: formData,
				});

				const data = await res.json();
				

				console.log("Cloudinary URL:", data.url);
				
			} catch (err) {
				console.error("Image or parsing error:", err);
			} finally {
				setSubmitting(false);
			}
		},
	});

    // Inside your Admin component
    useEffect(() => {
		const fetchImage = async () => {
			const userData = await fetch(
				`/api/imageUpload/${parseInt(currentUser.id)}`,
			);
			const data = await userData.json();
			if (data?.ProfileImage.length>0) {
				setProfileImage(data?.ProfileImage[0]?.profile_image);
			}
		};
		fetchImage();
	}, [])
	

    // ... keep your imports and logic as they are

return (
	<div className="min-h-screen p-8 text-white bg-slate-950 relative">
		{/* Header Section */}
		<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
			<div>
				<h1 className="text-3xl font-extrabold tracking-tight">
					Admin Dashboard
				</h1>
				<p className="text-slate-400 mt-1">
					Manage system resources and user permissions.
				</p>
			</div>

			<div className="flex gap-3">
				
				<button
					onClick={() => router.push("/AddDepartment")}
					className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
					<span className="text-lg">+</span> Department
				</button>
				<button
					onClick={() => router.push("/AddUser")}
					className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all">
					<span className="text-lg">+</span> New User
				</button>
			</div>
		</div>

		{/* Welcome Hero Section */}
		<div className="relative overflow-hidden bg-linear-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 mb-10">
			{/* Decorative Background Element */}
			<div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

			<div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
				{/* Profile Avatar Circle */}
				<div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-500/20">
					{currentUser?.name?.charAt(0) || "M"}
				</div>

				<div className="flex-1 text-center md:text-left">
					<div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
						<h1 className="text-3xl font-extrabold tracking-tight">
							Welcome back, {currentUser?.name || "Meet"}!
						</h1>
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 w-fit self-center">
							{currentUser?.role || "Admin"}
						</span>
					</div>

					<p className="text-slate-400 max-w-xl">
						Logged in as{" "}
						<span className="text-slate-200 font-medium">
							{currentUser?.email || "meet@gmail.com"}
						</span>
						.
						{currentUser?.dept_id === null
							? " You have global access across all departments."
							: ` Managing Department ID: ${currentUser.dept_id}`}
					</p>
				</div>

				{/* Quick Action Buttons */}
			</div>
		</div>

		{/* Stats Grid */}
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
			<Link href="/Admin/Intern">
				<StatCard
					title="Total Users"
					value={users.length}
					icon="👥"
					color="blue"
				/>
			</Link>
			<Link href="/Admin/Department">
				<StatCard
					title="Active Departments"
					value={departments.length}
					icon="🏢"
					color="purple"
				/>
			</Link>
			<StatCard
				title="Admin Roles"
				value={users.filter((u) => u.role === "Admin").length}
				icon="🛡️"
				color="indigo"
			/>
			{/* <StatCard title="Pending Review" value={0} icon="⏳" color="amber" /> */}
		</div>

		{/* Search & Global Filters Section */}

		{/* Secondary Info Grid */}
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<div className="">
				Upload Image
				<form onSubmit={formik.handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-white mb-1">
							Image
						</label>

						<input
							name="profile_Image"
							type="file"
							accept="image/*"
							onChange={(event) => {
								formik.setFieldValue(
									"profile_Image",
									event.currentTarget.files[0],
								);
							}}
							className={`w-full px-4 py-2 border rounded-lg outline-none bg-white transition-all text-black ${
								formik.touched.profile_Image && formik.errors.profile_Image
									? "border-red-500 ring-1 ring-red-500"
									: "border-gray-300 focus:ring-2 focus:ring-blue-500"
							}`}
						/>
						{formik.touched.profile_Image && formik.errors.profile_Image && (
							<p className="text-red-500 text-xs mt-1">
								{formik.errors.profile_Image}
							</p>
						)}
					</div>
					<button
						type="submit"
						disabled={formik.isSubmitting}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white  font-bold py-3 rounded-lg transition-colors disabled:bg-blue-300">
						{formik.isSubmitting ? "Creating..." : "Create user"}
					</button>
				</form>
			</div>

			<div className="relative w-24 h-24">
				<Image
					src={profileImage ? profileImage : "/userImage.svg"}
					alt="Profile"
					fill
					sizes="true"
					className="object-cover rounded-full"
				/>
			</div>
		</div>
	</div>
);
}

// Helper Components
function StatCard({ title, value, icon, color }) {
    const colors = {
        blue: "text-blue-400 bg-blue-400/10",
        purple: "text-purple-400 bg-purple-400/10",
        indigo: "text-indigo-400 bg-indigo-400/10",
        amber: "text-amber-400 bg-amber-400/10",
    };
    
    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-600 transition-colors">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <h4 className="text-3xl font-bold mt-1">{value}</h4>
        </div>
    );
}

