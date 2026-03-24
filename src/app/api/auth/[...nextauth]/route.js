import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // ✅ FIX 1

const HASURA_URL = process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET; // ✅ FIX 2

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},

			async authorize(credentials) {
				try {
					const query = `
                        query GetUser($email: String!) {
                            users(where: {email: {_eq: $email}}) {
                                id
                                name
                                email
                                password
                                role
                                deptartment_id
                            }
                        }
                    `;

					const res = await fetch(HASURA_URL, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"x-hasura-admin-secret": HASURA_ADMIN_SECRET,
						},
						body: JSON.stringify({
							query,
							variables: {
								email: credentials.email.toLowerCase(),
							},
						}),
					});

					// ✅ SAFE PARSING
					const text = await res.text();

					if (!text) {
						console.error("Empty Hasura response");
						return null;
					}

					let parsed;
					try {
						parsed = JSON.parse(text);
					} catch (err) {
						console.error("Invalid JSON:", text);
						return null;
					}

					if (parsed.errors) {
						console.error("Hasura error:", parsed.errors);
						return null;
					}

					const user = parsed.data?.users[0];
					if (!user) return null;

					const isValid = await bcrypt.compare(
						credentials.password,
						user.password,
					);
					if (!isValid) return null;

					return {
						id: String(user.id),
						name: user.name,
						email: user.email,
						role: user.role,
						deptId: user.deptartment_id,
					};
				} catch (err) {
					console.error("AUTH ERROR:", err);
					return null; // ✅ prevents 500 crash
				}
			},
		}),
	],

	session: { strategy: "jwt" },

	callbacks: {
		async session({ session, token }) {
			session.user.id = token.id;
			session.user.role = token.role;
			session.user.dept_id = token.dept_id;
			return session;
		},

		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.role = user.role;
				token.dept_id = user.deptId;
			}
			return token;
		},
	},

	// ✅ CUSTOM JWT
	jwt: {
		async encode({ token, secret }) {
			if (!token) return "";

			return jwt.sign(
				{
					sub: token.id,
					...token,
				},
				secret,
				{ algorithm: "HS256" },
			);
		},

		async decode({ token, secret }) {
			if (!token) return null;

			try {
				return jwt.verify(token, secret);
			} catch {
				return null;
			}
		},
	},

	pages: { signIn: "/Login" },

	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
