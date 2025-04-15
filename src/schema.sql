PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    password TEXT,
    role INTEGER
);

CREATE TABLE activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_id INTEGER,
    name TEXT,
    description TEXT,
    time TEXT,
    FOREIGN KEY (coach_id) REFERENCES users(id)
);

CREATE TABLE participation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trainee_id INTEGER,
    activity_id INTEGER,
    joined_at TEXT,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE trainee_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trainee_id INTEGER,
    activity_id INTEGER,
    stars INTEGER CHECK (stars BETWEEN 1 AND 5),
    comment TEXT,
    UNIQUE (activity_id, trainee_id),
    FOREIGN KEY (trainee_id) REFERENCES users(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE coach_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_id INTEGER,
    trainee_id INTEGER,
    activity_id INTEGER,
    feedback TEXT,
    FOREIGN KEY (coach_id) REFERENCES users(id),
    FOREIGN KEY (trainee_id) REFERENCES users(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);
