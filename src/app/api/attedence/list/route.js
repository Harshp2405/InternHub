import { NextResponse } from 'next/server';
import { hasuraFetch } from '../../../lib/hasura';


export async function GET() {

    const query = `
    query GetAttedence {
        Attedence(order_by: {id: asc}) {
          id
          user_Id
          checkIn
          checkOut
          user {
            name
            role
            DeptName {
              name
            }
          }
        }
      }
      
    `;

    try {
        const dataRes = await hasuraFetch(query);

        return NextResponse.json(dataRes.Attedence);
    } catch (error) {
        console.error("Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch interns" }, { status: 500 });
    }
}