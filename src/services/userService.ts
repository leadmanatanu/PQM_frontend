import { apiClient } from "./api-client";

export interface User {
	id: number;
	name: string;
	email: string;
	password?: string;
	role: "Admin" | "User";
	isActive: boolean;
}

// Backend user response
interface BackendUser {
	id: number;
	username: string;
	email: string;
	password?: string;
	isActive: boolean;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string | null;
	roleId: number;
	role: {
		id: number;
		name: string;
	};
}

// Convert backend user -> frontend user
const mapUser = (user: BackendUser): User => {
	return {
		id: user.id,
		name: user.username,
		email: user.email,
		password: user.password,
		role: user.role?.name === "Admin" ? "Admin" : "User",
		isActive: user.isActive,
	};
};

// ==========================================
// GET ALL USERS
// ==========================================

export const getAllUsers = async (): Promise<User[]> => {
	const response = await apiClient.get("/user/GetAllUsers");

	console.log("GetAllUsers response:", response.data);

	const data = response.data;

	// Case 1:
	// API returns an array
	if (Array.isArray(data)) {
		return data.map(mapUser);
	}

	// // Case 2:
	// // API returns { data: [...] }
	// if (Array.isArray(data?.data)) {
	// 	return data.data.map(mapUser);
	// }

	// // Case 3:
	// // API returns { users: [...] }
	// if (Array.isArray(data?.users)) {
	// 	return data.users.map(mapUser);
	// }

	// // Case 4:
	// // API returns ONE user object
	// if (data && typeof data === "object" && data.id) {
	// 	return [mapUser(data)];
	// }

	return [];
};

// ==========================================
// UPDATE USER
// ==========================================

export const updateUser = async (id: number, user: User): Promise<User> => {
	const response = await apiClient.put(`/user/UpdateUser/${id}`, {
		id: user.id,
		username: user.name,
		email: user.email,
		password: user.password,
		// isActive: user.isActive,
		roleId: user.role === "Admin" ? 1 : 2,
	});

	return mapUser(response.data);
};

// ==========================================
// DELETE USER
// ==========================================

export const deleteUser = async (id: number) => {
	const response = await apiClient.delete(`/user/DeleteUser/${id}`);

	return response.data;
};
