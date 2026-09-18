import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { ChartLineIcon } from "@phosphor-icons/react/dist/ssr/ChartLine";
import { ChartPieIcon } from "@phosphor-icons/react/dist/ssr/ChartPie";
import { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
import { Devices } from "@phosphor-icons/react/dist/ssr/Devices";
import { FileText } from "@phosphor-icons/react/dist/ssr/FileText";
import { Folder } from "@phosphor-icons/react/dist/ssr/Folder";
import { GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { XSquare } from "@phosphor-icons/react/dist/ssr/XSquare";

export const navIcons = {
	"chart-pie": ChartPieIcon,
	"gear-six": GearSixIcon,
	"plugs-connected": Folder,
	"x-square": XSquare,
	user: UserIcon,
	users: UsersIcon,
	devices: Devices,
	clock: Clock,
	report: FileText,
	chat: ChartLineIcon,
} as Record<string, Icon>;
