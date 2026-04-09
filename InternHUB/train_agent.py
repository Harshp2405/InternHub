"""
train_agent.py
==============
Training script for the InternHub Vanna agent.
Expects that the environment variables (GROQ, DB_PASSWORD, CHROMA_PATH) are set.
"""
 
import logging
from vanna_setup import vn, connect_to_postgres
 
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
 
# ── DDL (Data Definition Language) ──────────────────────────────────
DDL_STATEMENTS = [
    # Departments
    """
    CREATE TABLE "departments" (
        "id" serial,
        "name" text NOT NULL,
        CONSTRAINT "department_pkey" PRIMARY KEY("id")
    );
    """,
    # Users
    """
    CREATE TABLE "users" (
        "id" serial PRIMARY KEY,
        "name" text NOT NULL,
        "gender" text,
        "college" text,
        "role" text DEFAULT 'Intern',
        "department_id" integer REFERENCES "departments"("id") ON DELETE SET NULL,
        "created_at" timestamp DEFAULT now()
    );
    """,
    # Tasks
    """
    CREATE TABLE "tasks" (
        "id" serial PRIMARY KEY,
        "title" text NOT NULL,
        "description" text,
        "status" text,
        "priority" text,
        "due_date" timestamp,
        "created_at" timestamp DEFAULT now(),
        "assigned_to" integer REFERENCES "users"("id") ON DELETE SET NULL,
        "department_id" integer REFERENCES "departments"("id") ON DELETE SET NULL,
        "department_name" text
    );
    """
]
 
# ── Documentation ───────────────────────────────────────────────────
DOCUMENTATION = [
    """
    The InternHub database has 3 tables: departments, users, and tasks.
 
    TABLE: departments
    - Stores department names (e.g., PHP, Python, Design, HR, Engineering).
    - Columns: id (primary key), name.
    """,
    """
    TABLE: users
    - Stores all user accounts — both Interns and Admins and Heads.
    - The 'role' column holds 'Intern', 'Admin', or 'Head'.
    - IMPORTANT: The foreign key linking a user to a department is named 'department_id'.
    - To find what department a user belongs to, JOIN users.department_id = departments.id
    - Columns: id, name, gender, college, role, department_id, created_at.
    """,
    """
    TABLE: tasks
    - Stores tasks/assignments that can be linked to both a user and a department.
    - 'assigned_to' links to users.id — the user responsible for the task.
    - 'department_id' links to departments.id — the owning department.
    - 'department_name' is a text copy of the department name stored directly on the task.
    - 'status' values MUST USE Title Case exactly: 'Pending', 'In Progress', 'Completed', 'Cancelled'.
    - 'priority' values MUST USE Title Case exactly: 'Low', 'Medium', 'High'.
    - Columns: id, title, description, status, priority, due_date, created_at, assigned_to, department_id, department_name.
    """,
    """
    QUERY PATTERNS & JARGON:
    - CRITICAL RULE: NEVER use SELECT *. You must always use explicit column names to ensure confidential columns are not exposed. Email and password data must NEVER be queried or accessed under any circumstances. They do not exist in the schema you access.
    - When asked for "detail about" a specific person (e.g., "give me detail about Anjali Mishra") or a group (e.g., "detail about all interns"), ALWAYS use a LEFT JOIN with departments and tasks to include their role, department name, and all task data.
    - To list interns by department name: JOIN users u ON u.department_id = d.id WHERE d.name ILIKE 'DeptName' AND u.role = 'Intern'
    - 'frontend', 'designers', 'ui/ux', 'design' refers to the 'Design' department.
    - 'backend', 'devs', 'engineers', 'coders', 'IT', 'information technology', 'tech', 'software' refers to the 'Engineering' department.
    - 'hr', 'human resources', 'finance', 'management', 'operations' refers to the 'HR' department.
    - 'head' refers to a user with role = 'Head'. To find the head of a department: SELECT u.name FROM users u JOIN departments d ON u.department_id = d.id WHERE u.role = 'Head' AND d.name ILIKE 'DeptName'.
    - If a department name is mentioned that does not exist (e.g. Finance, IT, Sales), map it to the closest existing one: Finance/Management → HR, IT/Tech/Software → Engineering.
    - Always JOIN departments by name (using ILIKE).
    - Overdue tasks are tasks where: due_date < NOW() AND status != 'Completed'
    - Always use exact Title Case string matching when querying status (e.g. status = 'Pending') and priority (e.g. priority = 'High').
    - Valid department names in the database are: 'PHP', 'Python', 'Design', 'HR', 'Engineering'. Always use ILIKE when matching.
    """
]
 
# ── Golden Queries ──────────────────────────────────────────────────
GOLDEN_QUERIES = [
    # ── Users / Interns ─────────────────────────────────────────────
    {
        "question": "Show all interns.",
        "sql": "SELECT id, name, gender, college, role, created_at FROM users WHERE role = 'Intern';"
    },
    {
        "question": "List names of all interns.",
        "sql": "SELECT name FROM users WHERE role = 'Intern';"
    },
    {
        "question": "How many interns are there in total?",
        "sql": "SELECT COUNT(*) AS total_interns FROM users WHERE role = 'Intern';"
    },
    {
        "question": "Show all admin users.",
        "sql": "SELECT id, name, role FROM users WHERE role = 'Admin';"
    },
    {
        "question": "List all users.",
        "sql": "SELECT id, name, role, created_at FROM users;"
    },
    # ── Departments ─────────────────────────────────────────────────
    {
        "question": "List all departments.",
        "sql": "SELECT * FROM departments;"
    },
    {
        "question": "How many departments are there?",
        "sql": "SELECT COUNT(*) AS total_departments FROM departments;"
    },
    # ── Users + Departments JOIN ────────────────────────────────────
    {
        "question": "List all interns from the PHP department.",
        "sql": """
            SELECT u.id, u.name, u.college, u.gender
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE d.name = 'PHP' AND u.role = 'Intern';
        """
    },
    {
        "question": "List all interns from the Python department.",
        "sql": """
            SELECT u.id, u.name, u.college, u.gender
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE d.name = 'Python' AND u.role = 'Intern';
        """
    },
    {
        "question": "List all users in the Design department.",
        "sql": """
            SELECT u.id, u.name, u.role
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE d.name = 'Design';
        """
    },
    {
        "question": "How many interns are in each department?",
        "sql": """
            SELECT d.name AS department, COUNT(u.id) AS intern_count
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE u.role = 'Intern'
            GROUP BY d.name
            ORDER BY intern_count DESC;
        """
    },
    {
        "question": "Show all interns with their department name.",
        "sql": """
            SELECT u.id, u.name, u.college, d.name AS department
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE u.role = 'Intern'
            ORDER BY d.name;
        """
    },
    {
        "question": "Which department does the intern with name 'Raj' belong to?",
        "sql": """
            SELECT u.name, d.name AS department
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE u.name ILIKE '%Raj%';
        """
    },
    # ── Tasks ───────────────────────────────────────────────────────
    {
        "question": "Show all tasks.",
        "sql": "SELECT * FROM tasks ORDER BY created_at DESC;"
    },
    {
        "question": "Show all pending tasks.",
        "sql": "SELECT * FROM tasks WHERE status = 'Pending' ORDER BY due_date ASC;"
    },
    {
        "question": "Show all high priority tasks.",
        "sql": "SELECT * FROM tasks WHERE priority = 'High' ORDER BY due_date ASC;"
    },
    {
        "question": "Show all completed tasks.",
        "sql": "SELECT * FROM tasks WHERE status = 'Completed';"
    },
    # ── Tasks + Users JOIN ──────────────────────────────────────────
    {
        "question": "What tasks are assigned to user ID 1?",
        "sql": "SELECT * FROM tasks WHERE assigned_to = 1;"
    },
    {
        "question": "Show all tasks with the name of the assigned intern.",
        "sql": """
            SELECT t.id, t.title, t.status, t.priority, t.due_date, u.name AS assigned_to_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            ORDER BY t.created_at DESC;
        """
    },
    {
        "question": "List all tasks assigned to interns in the PHP department.",
        "sql": """
            SELECT t.title, t.status, t.priority, t.due_date, u.name AS intern_name
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id
            JOIN departments d ON u.department_id = d.id
            WHERE d.name = 'PHP' AND u.role = 'Intern';
        """
    },
    # ── Tasks + Departments JOIN ────────────────────────────────────
    {
        "question": "Show all tasks for the PHP department.",
        "sql": """
            SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date
            FROM tasks t
            JOIN departments d ON t.department_id = d.id
            WHERE d.name = 'PHP';
        """
    },
    {
        "question": "How many tasks does each department have?",
        "sql": """
            SELECT d.name AS department, COUNT(t.id) AS task_count
            FROM tasks t
            JOIN departments d ON t.department_id = d.id
            GROUP BY d.name
            ORDER BY task_count DESC;
        """
    },
    {
        "question": "Show overdue tasks.",
        "sql": """
            SELECT * FROM tasks
            WHERE due_date < NOW() AND status != 'Completed'
            ORDER BY due_date ASC;
        """
    },
    {
        "question": "How many tasks are pending vs completed?",
        "sql": """
            SELECT status, COUNT(*) AS count
            FROM tasks
            GROUP BY status;
        """
    },
   
    # ── Advanced Analytical Queries (NEW ADDITIONS) ─────────────────
    {
        "question": "Which intern has the most completed tasks?",
        "sql": """
            SELECT u.name, COUNT(t.id) AS completed_count
            FROM users u
            JOIN tasks t ON u.id = t.assigned_to
            WHERE t.status = 'Completed' AND u.role = 'Intern'
            GROUP BY u.id, u.name
            ORDER BY completed_count DESC
            LIMIT 1;
        """
    },
    {
        "question": "What is the overall completion rate of tasks per department?",
        "sql": """
            SELECT
                d.name AS department,
                COUNT(t.id) AS total_tasks,
                SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks,
                ROUND(SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(t.id), 0), 2) AS completion_percentage
            FROM departments d
            LEFT JOIN tasks t ON d.id = t.department_id
            GROUP BY d.name
            ORDER BY completion_percentage DESC;
        """
    },
    {
        "question": "Show me interns who have zero tasks assigned to them.",
        "sql": """
            SELECT u.id, u.name
            FROM users u
            LEFT JOIN tasks t ON u.id = t.assigned_to
            WHERE u.role = 'Intern' AND t.id IS NULL;
        """
    },
    {
        "question": "Show me tasks that are severely overdue (more than 7 days).",
        "sql": """
            SELECT t.id, t.title, t.due_date, t.status, u.name AS intern_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.due_date < (NOW() - INTERVAL '7 days')
              AND t.status != 'Completed'
            ORDER BY t.due_date ASC;
        """
    },
    {
        "question": "Which department receives the most high priority tasks?",
        "sql": """
            SELECT d.name AS department, COUNT(t.id) AS high_priority_count
            FROM departments d
            JOIN tasks t ON d.id = t.department_id
            WHERE t.priority = 'High'
            GROUP BY d.name
            ORDER BY high_priority_count DESC
            LIMIT 1;
        """
    },
    {
        "question": "give me detail about Pooja Joshi",
        "sql": """
            SELECT u.id, u.name, u.gender, u.college, u.role, d.name AS department_name, t.title AS task_title, t.status AS task_status, t.priority AS task_priority, t.due_date AS task_due_date
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN tasks t ON u.id = t.assigned_to
            WHERE u.name ILIKE '%Pooja Joshi%';
        """
    },
    {
        "question": "give me detail about Rahul Singh",
        "sql": """
            SELECT u.id, u.name, u.gender, u.college, u.role, d.name AS department_name, t.title AS task_title, t.status AS task_status, t.priority AS task_priority, t.due_date AS task_due_date
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN tasks t ON u.id = t.assigned_to
            WHERE u.name ILIKE '%Rahul Singh%';
        """
    },
    {
        "question": "give me detail about Anjali Mishra",
        "sql": """
            SELECT u.id, u.name, u.gender, u.college, u.role, d.name AS department_name, t.title AS task_title, t.status AS task_status, t.priority AS task_priority, t.due_date AS task_due_date
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN tasks t ON u.id = t.assigned_to
            WHERE u.name ILIKE '%Anjali Mishra%';
        """
    },
    {
        "question": "give me detail about all interns",
        "sql": """
            SELECT u.id, u.name, u.gender, u.college, u.role, d.name AS department_name, t.title AS task_title, t.status AS task_status, t.priority AS task_priority, t.due_date AS task_due_date
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN tasks t ON u.id = t.assigned_to
            WHERE u.role = 'Intern';
        """
    },
    {
        "question": "give me detail about all admins",
        "sql": """
            SELECT u.id, u.name, u.gender, u.college, u.role, d.name AS department_name, t.title AS task_title, t.status AS task_status, t.priority AS task_priority, t.due_date AS task_due_date
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN tasks t ON u.id = t.assigned_to
            WHERE u.role = 'Admin';
        """
    },
    {
        "question": "give me detail about all heads",
        "sql": """
            SELECT u.id, u.name, u.gender, u.college, u.role, d.name AS department_name, t.title AS task_title, t.status AS task_status, t.priority AS task_priority, t.due_date AS task_due_date
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN tasks t ON u.id = t.assigned_to
            WHERE u.role = 'Head';
        """
    },
    {
        "question": "Show the head of each department.",
        "sql": """
            SELECT d.name AS department, u.name AS head_name
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE u.role = 'Head'
            ORDER BY d.name;
        """
    },
    {
        "question": "Finance departments with head name",
        "sql": """
            SELECT d.name AS department, u.name AS head_name
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE u.role = 'Head' AND d.name ILIKE '%HR%';
        """
    },
    {
        "question": "Who is the head of the HR department?",
        "sql": """
            SELECT u.name
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE u.role = 'Head' AND d.name ILIKE '%HR%';
        """
    },
    {
        "question": "Who is the head of the Engineering department?",
        "sql": """
            SELECT u.name
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE u.role = 'Head' AND d.name ILIKE '%Engineering%';
        """
    },
    {
        "question": "give all tasks of IT department",
        "sql": """
            SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date
            FROM tasks t
            JOIN departments d ON t.department_id = d.id
            WHERE d.name ILIKE '%Engineering%';
        """
    },
    {
        "question": "Show all tasks of Engineering department.",
        "sql": """
            SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date
            FROM tasks t
            JOIN departments d ON t.department_id = d.id
            WHERE d.name ILIKE '%Engineering%';
        """
    },
    {
        "question": "Show all tasks for the HR department.",
        "sql": """
            SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date
            FROM tasks t
            JOIN departments d ON t.department_id = d.id
            WHERE d.name ILIKE '%HR%';
        """
    },
    {
        "question": "Show all tasks for the Python department.",
        "sql": """
            SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date
            FROM tasks t
            JOIN departments d ON t.department_id = d.id
            WHERE d.name ILIKE '%Python%';
        """
    },
    {
        "question": "Show all tasks for the Design department.",
        "sql": """
            SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date
            FROM tasks t
            JOIN departments d ON t.department_id = d.id
            WHERE d.name ILIKE '%Design%';
        """
    },
    {
        "question": "List all departments with their head name.",
        "sql": """
            SELECT d.name AS department, COALESCE(u.name, 'No Head Assigned') AS head_name
            FROM departments d
            LEFT JOIN users u ON u.department_id = d.id AND u.role = 'Head'
            ORDER BY d.name;
        """
    }
]
 
def run_training():
    logger.info("Starting comprehensive training of InternHub AI...")
 
    # 1. DDL — teaches the schema structure
    logger.info("Training DDL statements...")
    for ddl in DDL_STATEMENTS:
        vn.train(ddl=ddl)
 
    # 2. Documentation — teaches relationships and rules
    logger.info("Training documentation...")
    for doc in DOCUMENTATION:
        vn.train(documentation=doc)
 
    # 3. Golden Queries — teaches question → SQL mapping
    logger.info(f"Training {len(GOLDEN_QUERIES)} golden queries...")
    for query in GOLDEN_QUERIES:
        vn.train(question=query['question'], sql=query['sql'])
 
    logger.info("Training complete! ChromaDB seed successful.")
 
if __name__ == "__main__":
    run_training()