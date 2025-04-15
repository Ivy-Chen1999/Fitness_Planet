from db import get_db_connection
from datetime import datetime


def get_all_activities():
    conn = get_db_connection()
    sql = """
        SELECT a.id, a.name, a.time, u.name AS coach_name
        FROM activities a
        LEFT JOIN users u ON a.coach_id = u.id
        WHERE a.coach_id IS NOT NULL 
        ORDER BY a.time DESC
    """
    return [dict(row) for row in conn.execute(sql).fetchall()]


def get_activity_info(activity_id):
    conn = get_db_connection()
    sql = """
        SELECT a.id, a.name, a.description, a.time, u.name AS coach_name
        FROM activities a
        LEFT JOIN users u ON a.coach_id = u.id
        WHERE a.id = ?
    """
    row = conn.execute(sql, (activity_id,)).fetchone()
    return dict(row) if row else None


def get_my_activities(coach_id):
    conn = get_db_connection()
    sql = """
        SELECT id, name, time FROM activities
        WHERE coach_id = ? 
        ORDER BY time
    """
    return [dict(row) for row in conn.execute(sql, (coach_id,)).fetchall()]


def add_activity(name, description, time, coach_id):
    try:
        conn = get_db_connection()
        sql = """
            INSERT INTO activities (name, description, time, coach_id)
            VALUES (?, ?, ?, ?)
        """
        conn.execute(sql, (name, description, time, coach_id))
        conn.commit()
        return True
    except Exception:
        return False


def remove_activity(activity_id, coach_id):
    if not check_activity_exists(activity_id) or not check_coach_permission(activity_id, coach_id):
        return False
    conn = get_db_connection()
    sql = "DELETE FROM activities WHERE id = ? AND coach_id = ?"
    conn.execute(sql, (activity_id, coach_id))
    conn.commit()
    return True


def join_activity(activity_id, trainee_id):
    if not check_activity_exists(activity_id) or check_participation(activity_id, trainee_id):
        return False
    conn = get_db_connection()
    sql = """
        INSERT INTO participation (trainee_id, activity_id, joined_at, completed)
        VALUES (?, ?, ?, 0)
    """
    conn.execute(sql, (trainee_id, activity_id, datetime.now().isoformat()))
    conn.commit()
    return True


def get_participation(activity_id):
    conn = get_db_connection()
    sql = """
        SELECT u.id, u.name, p.completed, p.joined_at,
               COUNT(*) OVER() AS total_participants
        FROM participation p
        JOIN users u ON p.trainee_id = u.id
        WHERE p.activity_id = ?
        ORDER BY p.joined_at
    """
    return [dict(row) for row in conn.execute(sql, (activity_id,)).fetchall()]


def get_my_participation(trainee_id):
    conn = get_db_connection()
    sql = """
        SELECT a.name, a.time, p.completed
        FROM participation p
        JOIN activities a ON p.activity_id = a.id
        WHERE p.trainee_id = ?
        ORDER BY a.time
    """
    return [dict(row) for row in conn.execute(sql, (trainee_id,)).fetchall()]


def mark_as_completed(activity_id, trainee_id):
    if not check_activity_exists(activity_id) or not check_participation(activity_id, trainee_id):
        return False
    conn = get_db_connection()
    sql = """
        UPDATE participation SET completed = 1
        WHERE activity_id = ? AND trainee_id = ?
    """
    conn.execute(sql, (activity_id, trainee_id))
    conn.commit()
    return True


def add_review(activity_id, trainee_id, stars, comment):
    if not check_activity_exists(activity_id) or not check_participation(activity_id, trainee_id):
        return False
    try:
        conn = get_db_connection()
        sql = """
            INSERT INTO trainee_reviews (activity_id, trainee_id, stars, comment)
            VALUES (?, ?, ?, ?)
        """
        conn.execute(sql, (activity_id, trainee_id, stars, comment))
        conn.commit()
        return True
    except Exception:
        return False


def get_reviews(activity_id):
    conn = get_db_connection()
    sql = """
        SELECT u.name AS trainee_name, r.stars, r.comment
        FROM trainee_reviews r
        JOIN users u ON r.trainee_id = u.id
        WHERE r.activity_id = ?
        ORDER BY r.id
    """
    return [dict(row) for row in conn.execute(sql, (activity_id,)).fetchall()]


def add_feedback(activity_id, coach_id, trainee_id, feedback):
    if not check_activity_exists(activity_id) or not check_participation(activity_id, trainee_id):
        return False
    if not check_coach_permission(activity_id, coach_id):
        return False
    conn = get_db_connection()
    sql = """
        INSERT INTO coach_feedback (activity_id, coach_id, trainee_id, feedback)
        VALUES (?, ?, ?, ?)
    """
    conn.execute(sql, (activity_id, coach_id, trainee_id, feedback))
    conn.commit()
    return True


def get_my_feedback(activity_id, trainee_id):
    conn = get_db_connection()
    sql = """
        SELECT f.feedback
        FROM coach_feedback f
        WHERE f.activity_id = ? AND f.trainee_id = ?
    """
    results = conn.execute(sql, (activity_id, trainee_id)).fetchall()
    return [{"feedback": row["feedback"].strip()} for row in results if row["feedback"] and row["feedback"].strip()]


def check_activity_exists(activity_id):
    conn = get_db_connection()
    sql = "SELECT id FROM activities WHERE id = ?"
    return conn.execute(sql, (activity_id,)).fetchone() is not None


def check_coach_permission(activity_id, coach_id):
    conn = get_db_connection()
    sql = "SELECT id FROM activities WHERE id = ? AND coach_id = ?"
    return conn.execute(sql, (activity_id, coach_id)).fetchone() is not None


def check_participation(activity_id, trainee_id):
    conn = get_db_connection()
    sql = "SELECT id FROM participation WHERE activity_id = ? AND trainee_id = ?"
    return conn.execute(sql, (activity_id, trainee_id)).fetchone() is not None
