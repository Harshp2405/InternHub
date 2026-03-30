import tailwindAnimate from "tailwindcss-animate";
const nextConfig = {
	plugins: [tailwindAnimate],
	serverExternalPackages: ["@prisma/client"],
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
			},
		],
	},
};

export default nextConfig;
