"use client";
import React from "react";
import LogoutButton from "./logout";
import { useSelector } from "react-redux";
import { User } from "../../types/User";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Added to show active link state
import NavCheckIn from "./CheckIn";


interface NavLink {
    label: string;
    href: string;
    roles?: ("Admin" | "Intern" | "Head")[];
}

interface NavbarProps {
    title: string;
    links?: NavLink[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
}

interface RootState {
    auth: AuthState;
}

const NavItems: NavLink[] = [
	{ label: "Profile", href: "/Intern", roles: ["Intern"] },
	{ label: "Ask Ai", href: "/AskAi", roles: ["Intern", "Admin", "Head"] },
	{ label: "My Tasks", href: "/Intern/tasks", roles: ["Intern"] },
	{ label: "Intern List", href: "/Directory", roles: ["Intern"] },
	{ label: "Dashboard", href: "/Admin", roles: ["Admin"] },
	{ label: "All Tasks", href: "/Admin/tasks", roles: ["Admin"] },
	{ label: "Attendance", href: "/Admin/attedence", roles: ["Admin"] },
	{ label: "Home", href: "/Head", roles: ["Head"] },
	{ label: "Manage Tasks", href: "/Head/tasks", roles: ["Head"] },
	{ label: "About", href: "/About" },
];

const Navbar: React.FC<NavbarProps> = ({ title, links = NavItems }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const pathname = usePathname();

    const filteredLinks = links.filter((link) => {
        if (!link.roles) return true;
        if (!user || !user.role) return false;
        return link.roles.some(
            (role) => role.toLowerCase() === user.role.toLowerCase()
        );
    });

    return (
			<nav className="sticky top-0 z-50 w-full px-6 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					{/* Brand Logo Section */}
					<div className="flex items-center gap-8">
						<Link href="/" className="group flex items-center gap-2">
							<div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
								<span className="text-white font-black">P</span>
							</div>
							<h1 className="text-xl font-extrabold text-gray-900 tracking-tight uppercase">
								{title}
							</h1>
						</Link>

						{/* Navigation Links */}
						<ul className="hidden md:flex items-center space-x-1">
							{filteredLinks.map((link) => {
								const isActive = pathname === link.href;
								return (
									<li key={link.href}>
										<Link
											href={link.href}
											className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
												isActive
													? "text-indigo-600 bg-indigo-50"
													: "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
											}`}>
											{link.label}
										</Link>
									</li>
								);
							})}
						</ul>
					</div>

					<div className="flex items-center">
						<NavCheckIn />
					</div>


					{/* Right Side: User Profile & Logout */}
					<div className="flex items-center gap-6">
						{user && (
							<div className="hidden sm:flex flex-col items-end">
								<span className="text-sm font-semibold text-gray-800 leading-none">
									{user.name}
								</span>
								<span className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold mt-1">
									{user.role}
								</span>
							</div>
						)}

						<div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

						<div className="flex items-center">
							<LogoutButton />
						</div>
					</div>
				</div>
			</nav>
		);
};

export default Navbar;