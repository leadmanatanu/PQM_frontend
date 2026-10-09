export const paths = {
	home: "/",
	auth: { signIn: "/auth/sign-in", signUp: "/auth/sign-up", resetPassword: "/auth/reset-password" },
	dashboard: {
		devices: "/dashboard/devices",
		scheduling: "/dashboard/scheduling",
		devicereadings: "/dashboard/liveReadings",
		report: "/dashboard/report",
		user: "/dashboard/user",
	},
	errors: { notFound: "/errors/not-found" },
} as const;
