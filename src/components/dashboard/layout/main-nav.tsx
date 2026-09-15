import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Bell as BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { List as ListIcon } from "@phosphor-icons/react/dist/ssr/List";

import { usePopover } from "../../../hooks/use-popover";
import { useUser } from "../../../hooks/use-user";
import { usePathname } from "../../../lib/next-navigation-shim";
import { navItems } from "./config";
import { MobileNav } from "./mobile-nav";
import { UserPopover } from "./user-popover";

export function MainNav(): React.JSX.Element {
	const pathname = usePathname();
	const [openNav, setOpenNav] = React.useState<boolean>(false);
	const userPopover = usePopover<HTMLDivElement>();
	const { user } = useUser();

	const activeNavItem = navItems.find(
		(item) =>
			item.href &&
			(pathname === item.href || ((item.href as string) !== "/dashboard" && pathname.startsWith(item.href)))
	);
	const activeNavTitle = activeNavItem ? activeNavItem.title : "Devices";

	const displayName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.name : "Tarlok Singh";

	const avatarSrc = user?.avatar || (displayName?.trim()?.[0] || "U").toUpperCase();

	return (
		<React.Fragment>
			<Box
				component="header"
				sx={{
					borderBottom: "1px solid var(--mui-palette-divider)",
					backgroundColor: "var(--mui-palette-background-paper)",
					position: "sticky",
					top: 0,
					zIndex: "var(--MainNav-zIndex)",
					height: "var(--MainNav-height)",
				}}
			>
				<Stack
					direction="row"
					spacing={2}
					sx={{
						alignItems: "center",
						justifyContent: "space-between",
						height: "100%",
						px: { xs: 2, md: 3 },
					}}
				>
					{/* Left section: Hamburger button for mobile/tablet + Page Title */}
					<Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
						<IconButton
							onClick={(): void => {
								setOpenNav(true);
							}}
							aria-label="Open navigation menu"
							edge="start"
							sx={{
								display: { xs: "inline-flex", lg: "none" },
								color: "text.primary",
								p: 0.75,
								borderRadius: "6px",
								transition: "background-color 0.2s ease-in-out",
								"&:hover": {
									bgcolor: "action.hover",
								},
							}}
						>
							<ListIcon fontSize="22px" />
						</IconButton>

						{/* Top Page Title Breadcrumb */}
						<Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600, color: "text.primary" }}>
							{activeNavTitle}
						</Typography>
					</Stack>

					{/* Right section: Notification bell + User profile avatar */}
					<Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
						<Tooltip title="Notifications">
							<IconButton
								sx={{
									color: "text.secondary",
									p: 0.75,
									borderRadius: "6px",
									transition: "background-color 0.2s ease-in-out",
									"&:hover": {
										bgcolor: "action.hover",
										color: "text.primary",
									},
								}}
							>
								<Badge badgeContent={3} color="primary" variant="dot">
									<BellIcon fontSize="20px" />
								</Badge>
							</IconButton>
						</Tooltip>

						<Avatar
							onClick={userPopover.handleOpen}
							ref={userPopover.anchorRef}
							alt={displayName}
							sx={{
								cursor: "pointer",
								width: 32,
								height: 32,
								transition: "transform 0.15s ease, box-shadow 0.15s ease",
								"&:hover": {
									boxShadow: "0 0 0 2px var(--mui-palette-primary-main)",
								},
							}}
						>
							{avatarSrc}
						</Avatar>
					</Stack>
				</Stack>
			</Box>

			<UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />

			<MobileNav
				onClose={() => {
					setOpenNav(false);
				}}
				open={openNav}
			/>
		</React.Fragment>
	);
}
