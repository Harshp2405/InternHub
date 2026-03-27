import { NextResponse } from "next/server";

import { hasuraFetch } from "../../lib/hasura";

export async function POST(req) {
	try {
		const body = await req.json();
		const { userId, checkIn, checkOut } = body;

		// GraphQL mutation
		const mutation = `
mutation InsertAttedence($user_Id: Int, $checkIn: String, $checkOut: String) {
  insert_Attedence(
    objects: {
      user_Id: $user_Id,
      checkIn: $checkIn,
      checkOut: $checkOut
    }
  ) {
    affected_rows
    returning {
      id
      user_Id
      checkIn
      checkOut
    }
  }
}
`;

		const dataRes = await hasuraFetch(mutation, {
			user_Id: parseInt(userId),
			checkIn: checkIn ,
			checkOut: checkOut 
		});

		return NextResponse.json({
			res: "Successfull Added",
			data: dataRes,
		});
	} catch (error) {
		console.error("Upload error:", error);

		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
