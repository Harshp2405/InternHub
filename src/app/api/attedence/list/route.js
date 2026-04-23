import { NextResponse } from 'next/server';
import { hasuraFetch } from '../../../lib/hasura';


export async function GET() {

    const query = `
    query GetAttedence {
      Attedence(order_by: {id: desc}) {
        id
        user_Id
        checkIn
        checkOut
        Dept {
          department {
            name
          }
        }
        user {
          name
          role
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