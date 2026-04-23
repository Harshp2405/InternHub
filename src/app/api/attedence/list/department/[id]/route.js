import { NextResponse } from "next/server";
import { hasuraFetch } from "../../../../../lib/hasura";


export async function GET(req, { params }) {
    const { id } = await params;
    const dept = parseInt(id);

    const query = `
    query GetAttedenceById($id: Int!) {
        Attedence(where: {user: {department_id: {_eq: $id}}}, order_by: {id: asc}) {
          id
          user_Id
          checkIn
          checkOut
          user {
            name
          }
        }
      }
`;

    try {
        const dataRes = await hasuraFetch(query, { id: dept });

        return NextResponse.json(dataRes.Attedence);
    } catch (error) {
        console.error("Fetch Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch interns" },
            { status: 500 },
        );
    }
}


