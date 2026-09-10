import { paths } from "../../../paths";
import type { NavItemConfig } from "../../../types/nav";

export const navItems = [
	{ key: "devices", title: "Devices", href: paths.dashboard.devices, icon: "devices" },
	{ key: "scheduling", title: "Scheduling", href: paths.dashboard.scheduling, icon: "clock" },
	{ key: "devicereadings", title: "Live Reading", href: paths.dashboard.devicereadings, icon: "user" },
	{ key: "report", title: "Report", href: paths.dashboard.report, icon: "report" },
] satisfies NavItemConfig[];
