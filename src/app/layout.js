// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "../redux/provider";
import NavbarWrapper from "../components/navbarWrapper"; 
import IdleMonitor from "../components/IdleMonitor";
import FloatingChatWidget from "../../InternHUB/FloatingChatWidget";
import { ToastContainer } from "react-toastify";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ReduxProvider>
					<NavbarWrapper />
					<main>
						{/* <IdleMonitor/> */}
						{children}
					<ToastContainer autoClose={1500} closeOnClick={true} pauseOnHover={false}  />
					</main>
				</ReduxProvider>
			</body>
		</html>
	);
}