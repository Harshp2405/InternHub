import { NextResponse } from "next/server";
import { hasuraFetch } from "../../../lib/hasura";


export async function GET(request, { params }) {
    const { id } = await params;
    const user_id = parseInt(id);

    const query = `
    query GetProfileImage($user_id :Int) {
        ProfileImage(where: {user_id: {_eq: $user_id}}) {
          id
          user_id
          profile_image
        }
      }
    `;

    try {
        // hasuraFetch returns { data, errors }
        const result = await hasuraFetch(query, { user_id: user_id });

        if (result.errors) {
            return NextResponse.json(
                { error: result.errors[0].message },
                { status: 400 },
            );
        }

        // Use .json() static method
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}