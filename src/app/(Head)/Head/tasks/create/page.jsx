"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
// Import the functions from your lib
import { getDeptInterns, createTask } from '../../../../lib/useAdmin'; 

export default function CreateTaskPage() {
    const router = useRouter();
    const { user } = useSelector((state) => state.auth);

    // console.log("DEBUG: Component Rendered");
    // console.log("DEBUG: User Object:", user);
    // console.log("DEBUG: Dept ID Value:", user?.department_id);
    
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'Medium',
        test:[],
        due_date: ''
    });

    // 1. Fetch interns using the new utility function
    useEffect(() => {
        const fetchInterns = async () => {
            try {
                const data = await getDeptInterns(user.dept_id);
                setInterns(data);
            } catch (error) {
                console.error("Fetch Error:", error);
            }
        };

        if (user?.dept_id) {
            fetchInterns();
        }
    }, [user]);

    

    // 2. Handle Form Submission using the utility function
    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const taskObject = {
					title: formData.title,
					description: formData.description,
					priority: formData.priority,
					due_date: formData.due_date,
					assigned_to: parseInt(formData.assigned_to),
					test: formData.test,
					department_id: user.dept_id, // This is all you need!
					status: "Pending",
				};
        console.log(taskObject , "Task Object");

        // await createTask(taskObject);
        // alert("Task created successfully!");
        // router.push('/Head/tasks');
    } catch (error) {
        alert("Error: " + error.message);
    }
};

    return (
			<div className="p-8 bg-gray-50 min-h-screen text-gray-900">
				<div className="max-w-2xl mx-auto">
					<button
						onClick={() => router.back()}
						className="text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-2 transition-colors">
						← Back to Tasks
					</button>

					<h1 className="text-3xl font-bold mb-6 text-gray-900">
						Assign New Task
					</h1>

					<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md">
						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-2">
									Task Title
								</label>
								<input
									className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
									placeholder="e.g. Monthly Data Cleanup"
									onChange={(e) =>
										setFormData({ ...formData, title: e.target.value })
									}
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-500 mb-2">
									Description
								</label>
								<textarea
									className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24"
									placeholder="Describe the task details..."
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-500 mb-2">
										Assign To Intern
									</label>
									<select
										className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900"
										onChange={(e) =>
											setFormData({ ...formData, assigned_to: e.target.value })
										}
										required>
										<option value="">Select an Intern</option>
										{interns.map((i) => (
											<option key={i.id} value={i.id} className="bg-gray-50">
												{i.name}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-500 mb-2">
										Priority Level
									</label>
									<select
										className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
										value={formData.priority}
										onChange={(e) =>
											setFormData({ ...formData, priority: e.target.value })
										}>
										<option value="Low">Low</option>
										<option value="Medium">Medium</option>
										<option value="High">High</option>
									</select>
								</div>
							</div>

                            {/* ========================================================================================== */}
							{/* {Test Start} */}

							<div className="relative">
								<label className="block text-sm font-medium text-gray-500 mb-2">
									Assign To Interns
								</label>

								{/* Dropdown Container */}
								<div className="group relative">
									<div className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900 cursor-pointer flex justify-between items-center">
										<span className="text-sm">
											{formData.test.length > 0
												? `${formData.test.length} Intern(s) Selected`
												: "Select Interns"}
										</span>
										<svg
											className="w-4 h-4 text-gray-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												d="M19 9l-7 7-7-7"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>

									{/* The Actual Dropdown Menu */}
									<div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md transition-all max-h-60 overflow-y-auto p-2">
										{interns.map((i) => (
											<label
												key={i.id}
												className="flex items-center gap-3 p-2 hover:bg-blue-500/20 rounded-md cursor-pointer transition-colors mb-1">
												<input
													type="checkbox"
													className="w-4 h-4 rounded border-gray-300 bg-gray-200 text-blue-500 focus:ring-blue-500"
													checked={formData.test.includes(i.id)}
													onChange={(e) => {
														const selectedId = i.id;
														const currentSelection = formData.test;
														const newSelection = e.target.checked
															? [...currentSelection, selectedId]
															: currentSelection.filter(
																	(id) => id !== selectedId,
																);

														setFormData({
															...formData,
															test: newSelection,
														});
													}}
												/>
												<span className="text-sm text-gray-700">{i.name}</span>
											</label>
										))}
									</div>
								</div>
							</div>

							{/* {Test Over}========================================================================================= */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-500 mb-2">
										Due Date
									</label>
									<input
										type="date"
										className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
										onChange={(e) =>
											setFormData({ ...formData, due_date: e.target.value })
										}
										required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-500 mb-2">
										Department (Auto)
									</label>
									<input
										value={
											user?.department_name || user?.department?.name || ""
										}
										disabled
										className="w-full bg-gray-100 border border-gray-200 p-3 rounded-lg text-gray-400 cursor-not-allowed italic"
									/>
								</div>
							</div>

							<button
								type="submit"
								disabled={loading}
								className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
									loading
										? "bg-gray-200 cursor-not-allowed"
										: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]"
								}`}>
								{loading ? "Creating Task..." : "Confirm & Assign Task"}
							</button>
						</form>
					</div>
				</div>
			</div>
		);
}   