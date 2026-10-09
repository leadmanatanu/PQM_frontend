"use client";

import React, { useEffect, useState } from "react";

import { deleteUser, getAllUsers, updateUser, User } from "../../../services/userService";

const UserManagement: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [editForm, setEditForm] = useState<User | null>(null);

	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const showMessage = (type: "success" | "error", message: string) => {
		if (type === "success") {
			setSuccess(message);
			setError("");
		} else {
			setError(message);
			setSuccess("");
		}

		setTimeout(() => {
			setSuccess("");
			setError("");
		}, 2000);
	};

	// =====================================================
	// GET ALL USERS
	// =====================================================

	const fetchUsers = async () => {
		try {
			setLoading(true);
			setError("");

			const data = await getAllUsers();

			setUsers(data);
		} catch (error) {
			console.error("Error fetching users:", error);

			setError("Unable to load users.");
		} finally {
			setLoading(false);
		}
	};

	// =====================================================
	// LOAD USERS ON PAGE LOAD
	// =====================================================

	useEffect(() => {
		fetchUsers();
	}, []);

	// =====================================================
	// OPEN EDIT MODAL
	// =====================================================

	const handleEdit = (user: User) => {
		setSelectedUser(user);

		setEditForm({
			...user,
		});

		setShowEditModal(true);
	};

	// =====================================================
	// SAVE USER
	// =====================================================

	const handleSaveEdit = async () => {
		if (!editForm) return;

		try {
			setSaving(true);
			setError("");
			setSuccess("");

			const updatedUser = await updateUser(editForm.id, editForm);

			setUsers((previousUsers) => previousUsers.map((user) => (user.id === editForm.id ? updatedUser : user)));

			setShowEditModal(false);
			setSelectedUser(null);
			setEditForm(null);

			showMessage("success", "User updated successfully.");
		} catch (error) {
			console.error("Error updating user:", error);

			showMessage("error", "Unable to update user.");
		} finally {
			setSaving(false);
		}
	};

	// =====================================================
	// OPEN DELETE MODAL
	// =====================================================

	const handleDeleteClick = (user: User) => {
		setSelectedUser(user);
		setShowDeleteModal(true);
	};

	// =====================================================
	// DELETE USER
	// =====================================================

	const handleDeleteConfirm = async () => {
		if (!selectedUser) return;

		try {
			setDeleting(true);
			setError("");

			await deleteUser(selectedUser.id);

			setUsers((previousUsers) => previousUsers.filter((user) => user.id !== selectedUser.id));

			setShowDeleteModal(false);
			setSelectedUser(null);

			showMessage("success", "User deleted successfully.");
		} catch (error) {
			console.error("Error deleting user:", error);

			showMessage("error", "Unable to delete user.");
		} finally {
			setDeleting(false);
		}
	};

	// =====================================================
	// CLOSE EDIT
	// =====================================================

	const closeEditModal = () => {
		if (saving) return;

		setShowEditModal(false);
		setSelectedUser(null);
		setEditForm(null);
	};

	// =====================================================
	// CLOSE DELETE
	// =====================================================

	const closeDeleteModal = () => {
		if (deleting) return;

		setShowDeleteModal(false);
		setSelectedUser(null);
	};

	return (
		<div className="w-full p-5">
			{/* PAGE HEADER */}
			{/* <div className="mb-5">
				<h2 className="text-[22px] font-semibold text-[#242936]">User Management</h2>
			</div> */}

			{error && (
				<div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600">{error}</div>
			)}

			{success && (
				<div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-sm text-green-600">
					{success}
				</div>
			)}

			{/* =========================
          TABLE
      ========================= */}
			<div className="w-full overflow-x-auto rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<table className="w-full min-w-[750px] border-collapse">
					<thead className="bg-[#fafafa]">
						<tr>
							<th className="border-b border-[#e5e7eb] px-4 py-1.5 text-left text-[12px] font-semibold text-[#526078]">
								Name
							</th>

							<th className="border-b border-[#e5e7eb] px-4 py-1.5 text-left text-[12px] font-semibold text-[#526078]">
								Email
							</th>

							<th className="border-b border-[#e5e7eb] px-4 py-1.5 text-left text-[12px] font-semibold text-[#526078]">
								Role
							</th>

							<th className="border-b border-[#e5e7eb] px-4 py-1.5 text-left text-[12px] font-semibold text-[#526078]">
								Active
							</th>

							<th className="border-b border-[#e5e7eb] px-4 py-1.5 text-left text-[12px] font-semibold text-[#526078]">
								Action
							</th>
						</tr>
					</thead>

					<tbody>
						{/* LOADING */}

						{loading && (
							<tr>
								<td colSpan={5} className="py-10 text-center text-sm text-gray-500">
									Loading users...
								</td>
							</tr>
						)}

						{/* USERS */}

						{!loading &&
							users.map((user) => (
								<tr key={user.id} className="transition-colors hover:bg-[#fafbff]">
									{/* NAME */}

									<td className="border-b border-[#eeeeee] px-4 py-1.5 text-[13px] text-[#1f2937]">{user.name}</td>

									{/* EMAIL */}

									<td className="border-b border-[#eeeeee] px-4 py-1.5 text-[13px] text-[#1f2937]">{user.email}</td>

									{/* ROLE */}

									<td className="border-b border-[#eeeeee] px-4 py-1.5 text-[13px] text-[#1f2937]">{user.role}</td>

									{/* ACTIVE */}

									<td className="border-b border-[#eeeeee] px-4 py-1.5">
										{user.isActive ? (
											<span className="inline-flex rounded-[5px] bg-[#e8f8f3] px-2 py-1 text-xs font-medium text-[#008f72]">
												Active
											</span>
										) : (
											<span className="inline-flex rounded-[5px] bg-[#f0f1f3] px-2 py-1 text-xs font-medium text-[#6b7280]">
												Not Active
											</span>
										)}
									</td>

									{/* ACTION */}

									<td className="border-b border-[#eeeeee] px-4 py-1.5">
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => handleEdit(user)}
												className="rounded-md border border-[#7775ff] bg-white px-2 py-1 text-[13px] text-[#5d5cf6] transition hover:bg-[#f1f0ff]"
											>
												Edit
											</button>

											<button
												type="button"
												onClick={() => handleDeleteClick(user)}
												className="rounded-md border border-[#ff7777] bg-white px-2 py-1 text-[13px] text-[#ef4444] transition hover:bg-[#fff1f1]"
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							))}

						{/* NO USERS */}

						{!loading && users.length === 0 && !error && (
							<tr>
								<td colSpan={5} className="py-10 text-center text-sm text-gray-500">
									No users found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* =====================================================
          EDIT User MODAL
      ===================================================== */}

			{showEditModal && editForm && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
					<div className="w-[560px] max-w-full overflow-hidden rounded-xl bg-white shadow-2xl">
						{/* HEADER */}
						<div className="border-b border-[#e5e7eb] px-7 py-[18px]">
							<h3 className="text-[18px] font-semibold text-[#252b38]">Edit User</h3>
						</div>

						{/* BODY */}
						<div className="space-y-[18px] px-7 py-[22px]">
							{/* NAME */}
							<div>
								<label className="mb-1.5 block text-[12px] font-medium text-[#5f6b7a]">Name</label>

								<input
									type="text"
									value={editForm.name}
									onChange={(e) =>
										setEditForm({
											...editForm,
											name: e.target.value,
										})
									}
									className="h-10 w-full rounded-md border border-[#d5d8df] px-3 text-sm text-[#252b38] outline-none transition focus:border-[#6661ff] focus:ring-2 focus:ring-[#6661ff]/10"
								/>
							</div>

							{/* EMAIL */}
							<div>
								<label className="mb-1.5 block text-[12px] font-medium text-[#5f6b7a]">Email</label>

								<input
									type="email"
									value={editForm.email}
									onChange={(e) =>
										setEditForm({
											...editForm,
											email: e.target.value,
										})
									}
									className="h-10 w-full rounded-md border border-[#d5d8df] px-3 text-sm text-[#252b38] outline-none transition focus:border-[#6661ff] focus:ring-2 focus:ring-[#6661ff]/10"
								/>
							</div>

							{/* PASSWORD */}
							<div>
								<label className="mb-1.5 block text-[12px] font-medium text-[#5f6b7a]">Password</label>

								<input
									type="password"
									value={editForm.password || ""}
									onChange={(e) =>
										setEditForm({
											...editForm,
											password: e.target.value,
										})
									}
									disabled={saving}
									placeholder="Enter password"
									className="h-10 w-full rounded-md border border-[#d5d8df] px-3 text-sm text-[#252b38] outline-none transition focus:border-[#6661ff] focus:ring-2 focus:ring-[#6661ff]/10 disabled:bg-gray-100"
								/>
							</div>

							{/* ROLE */}
							<div>
								<label className="mb-1.5 block text-[12px] font-medium text-[#5f6b7a]">Role</label>

								<select
									value={editForm.role}
									onChange={(e) =>
										setEditForm({
											...editForm,
											role: e.target.value as "Admin" | "User",
										})
									}
									disabled={saving}
									className="h-10 w-full rounded-md border border-[#d5d8df] bg-white px-3 text-sm text-[#252b38] outline-none focus:border-[#6661ff] focus:ring-2 focus:ring-[#6661ff]/10 disabled:bg-gray-100"
								>
									<option value="Admin">Admin</option>

									<option value="User">User</option>
								</select>
							</div>

							{/* ACTIVE STATUS */}
							{/* <div className="flex items-center gap-3 pt-1">
								<span className="mr-1 text-[12px] font-medium text-[#5f6b7a]">Active Status</span>

								<button
									type="button"
									onClick={() =>
										setEditForm({
											...editForm,
											isActive: !editForm.isActive,
										})
									}
									className={`relative h-5 w-[38px] rounded-full transition ${
										editForm.isActive ? "bg-[#635bff]" : "bg-[#c7c9d1]"
									}`}
								>
									<span
										className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
											editForm.isActive ? "translate-x-[18px]" : "translate-x-0.5"
										}`}
									/>
								</button>

								<span className="text-[12px] text-[#4b5563]">{editForm.isActive ? "Active" : "Not Active"}</span>
							</div> */}
						</div>

						{/* FOOTER */}
						<div className="flex items-center justify-end gap-3 border-t border-[#e0e2e6] px-7 py-[15px]">
							<button
								type="button"
								onClick={closeEditModal}
								className="rounded-md px-3.5 py-1.5 text-sm text-[#293241] transition hover:bg-[#f5f5f5]"
							>
								Cancel
							</button>

							<button
								type="button"
								onClick={handleSaveEdit}
								className="rounded-md bg-[#6258ff] px-[18px] py-1.5 text-sm font-medium text-white transition hover:bg-[#5148e8]"
							>
								Update User
							</button>
						</div>
					</div>
				</div>
			)}

			{/* =====================================================
          DELETE User MODAL
      ===================================================== */}

			{showDeleteModal && selectedUser && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
					<div className="w-[450px] max-w-full overflow-hidden rounded-[12px] bg-white shadow-2xl">
						{/* HEADER */}
						<div className="border-b border-[#e5e7eb] px-7 py-[18px]">
							<h3 className="text-[18px] font-semibold text-[#252b38]">Delete User</h3>
						</div>

						{/* BODY */}
						<div className="px-7 pb-6 pt-5">
							<p className="mb-4 text-sm text-[#424957]">Are you sure you want to delete this User?</p>

							<div className="flex flex-col gap-1 text-[12px] text-[#687386]">
								<strong className="text-sm text-[#252b38]">{selectedUser.name}</strong>

								<span>{selectedUser.email}</span>
							</div>
						</div>

						{/* FOOTER */}
						<div className="flex items-center justify-end gap-3 border-t border-[#e0e2e6] px-7 py-[15px]">
							<button
								type="button"
								onClick={closeDeleteModal}
								className="rounded-md px-3.5 py-1.5 text-sm text-[#293241] transition hover:bg-[#f5f5f5]"
							>
								Cancel
							</button>

							<button
								type="button"
								onClick={handleDeleteConfirm}
								className="rounded-md bg-[#ef3f35] px-[18px] py-1.5.5 text-sm font-medium text-white transition hover:bg-[#d9362d]"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default UserManagement;
