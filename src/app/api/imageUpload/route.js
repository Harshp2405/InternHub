import { NextResponse } from "next/server";
import cloudinary from "../../lib/cloudinary";
import { hasuraFetch } from "../../lib/hasura";

export async function POST(req) {
	try {
		const data = await req.formData();

		const file = data.get("file");
		const user_id = data.get("user_id");

		if (!file) {
			return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const result = await new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream({ folder: "internhub" }, (error, result) => {
					if (error) reject(error);
					else resolve(result);
				})
				.end(buffer);
		});

		const imageUrl = result.secure_url;

		// GraphQL mutation
		const mutation = `
		mutation InsertProfileImage($profile_image: String!, $user_id: Int!) {
			insert_ProfileImage_one(
			  object: {
				profile_image: $profile_image
				user_id: $user_id
			  }
			  on_conflict: {
				constraint: ProfileImage_user_id_key
				update_columns: [profile_image]
			  }
			) {
			  id
			  profile_image
			}
		  }
		`;

		const dataRes = await hasuraFetch(mutation, {
			profile_image: imageUrl,
			user_id: parseInt(user_id),
		});

		return NextResponse.json({
			url: imageUrl,
			db: dataRes,
		});
	} catch (error) {
		console.error("Upload error:", error);

		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
