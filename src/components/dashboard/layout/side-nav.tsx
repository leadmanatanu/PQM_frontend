"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CaretLeft as CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRight as CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { GearSix as GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { SignOut as SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";

import { Logo } from "../../../components/core/logo";
import RouterLink from "../../../components/RouterLink";
import { useUser } from "../../../hooks/use-user";
import { authClient } from "../../../lib/auth/client";
import { logger } from "../../../lib/default-logger";
import { isNavItemActive } from "../../../lib/is-nav-item-active";
import { usePathname, useRouter } from "../../../lib/next-navigation-shim";
import { paths } from "../../../paths";
import type { NavItemConfig } from "../../../types/nav";
import { navItems } from "./config";
import { navIcons } from "./nav-icons";

interface SideNavProps {
	collapsed: boolean;
	onToggle: () => void;
}

export function SideNav({ collapsed, onToggle }: SideNavProps): React.JSX.Element {
	const pathname = usePathname();
	const router = useRouter();
	const { user, checkSession } = useUser();

	const displayName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.name : "Tarlok Singh";
	const emailAddress = user?.email || "tarlokthakur@gmail.com";
	const avatarSrc = user?.avatar || displayName?.charAt(0).toUpperCase() || "U";

	const handleSignOut = React.useCallback(async (): Promise<void> => {
		try {
			const { error } = await authClient.signOut();

			if (error) {
				logger.error("Sign out error", error);
				return;
			}

			await checkSession?.();
			router.refresh();
		} catch (error) {
			logger.error("Sign out error", error);
		}
	}, [checkSession, router]);

	return (
		<Box
			sx={{
				"--SideNav-background": "var(--mui-palette-neutral-950)",
				"--SideNav-color": "var(--mui-palette-common-white)",
				"--NavItem-color": "var(--mui-palette-neutral-300)",
				"--NavItem-hover-background": "rgba(255, 255, 255, 0.06)",
				"--NavItem-active-background": "var(--mui-palette-primary-main)",
				"--NavItem-active-color": "var(--mui-palette-primary-contrastText)",
				"--NavItem-disabled-color": "var(--mui-palette-neutral-500)",
				"--NavItem-icon-color": "var(--mui-palette-neutral-400)",
				"--NavItem-icon-active-color": "var(--mui-palette-primary-contrastText)",
				"--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
				bgcolor: "var(--SideNav-background)",
				color: "var(--SideNav-color)",
				display: { xs: "none", lg: "flex" },
				flexDirection: "column",
				height: "100%",
				left: 0,
				maxWidth: "100%",
				position: "fixed",
				scrollbarWidth: "none",
				top: 0,
				width: collapsed ? "72px" : "var(--SideNav-width)",
				transition: "width 0.25s ease-in-out",
				overflow: "hidden",
				zIndex: "var(--SideNav-zIndex)",
				"&::-webkit-scrollbar": { display: "none" },
			}}
		>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent={collapsed ? "center" : "space-between"}
				sx={{ height: "var(--MainNav-height, 52px)", px: collapsed ? 1 : 2.5, position: "relative" }}
			>
				<Box
					component={RouterLink}
					href={paths.home}
					sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
				>
					<Logo color="light" emblem={collapsed} height={28} width={collapsed ? 28 : 108} />
				</Box>

				<Box
					component="button"
					onClick={onToggle}
					aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: 28,
						height: 28,
						border: "none",
						borderRadius: "6px",
						background: "transparent",
						color: "var(--mui-palette-neutral-400)",
						cursor: "pointer",
						position: collapsed ? "absolute" : "static",
						right: collapsed ? 6 : undefined,
						top: collapsed ? 12 : undefined,
						flexShrink: 0,
						"&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)", color: "var(--mui-palette-common-white)" },
					}}
				>
					{collapsed ? <CaretRightIcon size={18} /> : <CaretLeftIcon size={18} />}
				</Box>
			</Stack>
			<Divider sx={{ borderColor: "var(--mui-palette-neutral-800)" }} />
			<Box component="nav" sx={{ flex: "1 1 auto", px: 1.5, py: 2 }}>
				{renderNavItems({ pathname, items: navItems, collapsed })}
			</Box>
		</Box>
	);
}

function renderNavItems({
	items = [],
	pathname,
	collapsed,
}: {
	items?: NavItemConfig[];
	pathname: string;
	collapsed: boolean;
}): React.JSX.Element {
	const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
		const { key, ...item } = curr;

		acc.push(<NavItem key={key} pathname={pathname} collapsed={collapsed} {...item} />);

		return acc;
	}, []);

	return (
		<Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
			{children}
		</Stack>
	);
}

interface NavItemProps extends Omit<NavItemConfig, "items"> {
	pathname: string;
	collapsed: boolean;
}

function NavItem({
	disabled,
	external,
	href,
	icon,
	matcher,
	pathname,
	title,
	collapsed,
}: NavItemProps): React.JSX.Element {
	const active = isNavItemActive({ disabled, external, href, matcher, pathname });
	const Icon = icon ? navIcons[icon] : null;

	return (
		<li>
			<Box
				{...(href
					? {
							component: external ? "a" : RouterLink,
							href,
							target: external ? "_blank" : undefined,
							rel: external ? "noreferrer" : undefined,
						}
					: { role: "button" })}
				sx={{
					alignItems: "center",
					borderRadius: "8px",
					color: "var(--NavItem-color)",
					cursor: "pointer",
					display: "flex",
					flex: "0 0 auto",
					gap: collapsed ? 0 : 1.5,
					justifyContent: collapsed ? "center" : "flex-start",
					p: collapsed ? "10px 0" : "8px 14px",
					position: "relative",
					textDecoration: "none",
					whiteSpace: "nowrap",
					transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
					"&:hover": {
						bgcolor: "var(--NavItem-hover-background)",
						color: "var(--mui-palette-common-white)",
					},
					...(disabled && {
						bgcolor: "var(--NavItem-disabled-background)",
						color: "var(--NavItem-disabled-color)",
						cursor: "not-allowed",
					}),
					...(active && {
						bgcolor: "var(--NavItem-active-background)",
						color: "var(--NavItem-active-color)",
						fontWeight: 600,
						"&:hover": {
							bgcolor: "var(--NavItem-active-background)",
						},
					}),
				}}
			>
				{Icon ? (
					<Icon
						fill={active ? "var(--NavItem-icon-active-color)" : "var(--NavItem-icon-color)"}
						fontSize="20px"
						weight={active ? "fill" : undefined}
					/>
				) : null}
				{!collapsed && (
					<Box sx={{ flex: "1 1 auto" }}>
						<Typography
							component="span"
							sx={{
								color: "inherit",
								fontSize: "0.875rem",
								fontWeight: active ? 600 : 500,
								lineHeight: "24px",
							}}
						>
							{title}
						</Typography>
					</Box>
				)}
			</Box>
		</li>
	);
}
