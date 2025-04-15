from db import get_db_connection


def get_trainee_stats(trainee_id):
    conn = get_db_connection()

    summary_sql = """
        SELECT COUNT(*) AS total_courses,
               SUM(CASE WHEN p.completed THEN 1 ELSE 0 END) AS completed_courses,
               COALESCE(ROUND(SUM(CASE WHEN p.completed THEN 1.0 ELSE 0 END)  / COUNT(*) * 100, 2), 0) AS completion_rate
        FROM participation p
        WHERE p.trainee_id = ?
    """
    summary_row = conn.execute(summary_sql, (trainee_id,)).fetchone()

    details_sql = """
        SELECT a.name AS activity_name, p.completed
        FROM participation p
        LEFT JOIN activities a ON p.activity_id = a.id
        WHERE p.trainee_id = ?
        ORDER BY a.name
    """
    details = conn.execute(details_sql, (trainee_id,)).fetchall()

    return {
        "summary": dict(summary_row) if summary_row else {},
        "participation": [dict(row) for row in details]
    }


def get_coach_stats(coach_id):
    conn = get_db_connection()
    coach_sql = """
        SELECT a.id AS activity_id, a.name AS activity_name,
               COUNT(p.id) AS total_participants,
               SUM(CASE WHEN p.completed THEN 1 ELSE 0 END) AS completed_count,
               COALESCE(ROUND(SUM(CASE WHEN p.completed THEN 1.0 ELSE 0 END) / NULLIF(COUNT(p.id), 0) * 100, 2), 0) AS completion_rate,
               COALESCE(AVG(r.stars), 0) AS average_rating
        FROM activities a
        LEFT JOIN participation p ON a.id = p.activity_id
        LEFT JOIN trainee_reviews r ON a.id = r.activity_id
        WHERE a.coach_id = ?
        GROUP BY a.id, a.name
        ORDER BY a.name
    """
    rows = conn.execute(coach_sql, (coach_id,)).fetchall()
    return [dict(row) for row in rows]
