// app/api/departmentdetails/[id]/route.js
import { NextResponse } from "next/server";
import { hasuraFetch } from "../../../../lib/hasura";

export async function GET(request, { params }) {
	const { id } = await params;
	const deptId = parseInt(id);

	const query = `
        query GetDeptAndUsers($id: Int!) {
            departments_by_pk(id: $id) {
                id
                name
            }
            users(where: {department_id: {_eq:$id}}, order_by: {role: asc}) {
                id
                name
                role
                gender
                email
                department_id
            }
        }
    `;

	try {
		// hasuraFetch returns { data, errors }
		const result = await hasuraFetch(query, { id: deptId });

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


export async function DELETE(request, { params }) {
	try {
		const { id } = await params;
		const deptId = parseInt(id);
		console.log(
			deptId,
			"Dept Id ==========================================================================",
		);

		// 1. First, fetch the current head_id so we know who to demote
		const getHeadQuery = `
            query GetDeptHead($id: Int!) {
                departments_by_pk(id: $id) {
                    head_id
                }
            }
        `;
		const headData = await hasuraFetch(getHeadQuery, { id: deptId });
		const headId = headData?.data?.departments_by_pk?.head_id;

		// 2. Define the Multi-Mutation
		const deleteMutation = `
            mutation DeleteAndCleanup($id: Int!, $head_id: Int) {

                demoteHead: update_users(
                    where: { id: { _eq: $head_id } },
                    _set: { role: "Intern", department_id: null }
                ) {
                    affected_rows
                }

                detachStaff: update_users(
                    where: { department_id: { _eq: $id } },
                    _set: { department_id: null }
                ) {
                    affected_rows
                }

                deleteDept: delete_departments_by_pk(id: $id) {
                    id
                    name
                }
            }
        `;

		// 3. Execute the cleanup and deletion
		const result = await hasuraFetch(deleteMutation, {
			id: deptId,
			head_id: headId || 0, // Use 0 or null if no head exists
		});

		if (result.errors) {
			return NextResponse.json(
				{ error: result.errors[0].message },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{
				message: "Department deleted and staff updated successfully",
				deletedId: deptId,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Delete Route Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
