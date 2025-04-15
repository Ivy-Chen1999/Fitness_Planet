import sqlite3
import os

DB_PATH = "/data/app.db"


def init_db():
    schema = """
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        password TEXT,
        role INTEGER
    );

    CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        coach_id INTEGER,
        name TEXT,
        description TEXT,
        time TEXT,
        FOREIGN KEY (coach_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS participation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trainee_id INTEGER,
        activity_id INTEGER,
        joined_at TEXT,
        completed INTEGER DEFAULT 0,
        FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trainee_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trainee_id INTEGER,
        activity_id INTEGER,
        stars INTEGER CHECK (stars BETWEEN 1 AND 5),
        comment TEXT,
        UNIQUE (activity_id, trainee_id),
        FOREIGN KEY (trainee_id) REFERENCES users(id),
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coach_feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        coach_id INTEGER,
        trainee_id INTEGER,
        activity_id INTEGER,
        feedback TEXT,
        FOREIGN KEY (coach_id) REFERENCES users(id),
        FOREIGN KEY (trainee_id) REFERENCES users(id),
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
    );
    """

    conn = sqlite3.connect(DB_PATH)
    conn.executescript(schema)
    conn.commit()
    conn.close()
    print("Initialized app.db with schema")


if __name__ == "__main__":
    init_db()
