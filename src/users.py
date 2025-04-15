from db import get_db_connection
from werkzeug.security import check_password_hash, generate_password_hash
from flask import session, request, abort
import os


def login(name, password):
  
    conn = get_db_connection()
    sql = "SELECT password, id, role FROM users WHERE name = ?"
    user = conn.execute(sql, (name,)).fetchone()

    if not user:
        print(f"Login failed: User {name} not found.")  
        return False

    if not check_password_hash(user["password"], password):
        print(f"Login failed: Incorrect password for {name}.") 
        return False

  
    session["user_id"] = user["id"]
    session["user_name"] = name
    session["user_role"] = user["role"]
    session["csrf_token"] = os.urandom(16).hex()

    print(f"User {name} logged in successfully.")  
    return {
        "id": user["id"],
        "name": name,
        "role": user["role"]
    }


def logout():
    """注销用户"""
    print(f"User {session.get('user_name')} logged out.")  
    session.clear()


def register(name, password, role):
    hash_value = generate_password_hash(password)  
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        
        cursor.execute("SELECT * FROM users WHERE name = ?", (name,))
        user = cursor.fetchone()
        if user:
            return "duplicate"  

        
        cursor.execute(
            "INSERT INTO users (name, password, role) VALUES (?, ?, ?)", (name, hash_value, role))
        conn.commit()

        print(f"User {name} registered successfully.")  
        return login(name, password)  
    except Exception as e:
        print(f"Error occurred during registration: {e}")  
        conn.rollback()  
        return False  


def user_id():
    
    return session.get("user_id", 0)


def user_role():
    
    return session.get("user_role", 0)


def is_logged_in():
    
    return "user_id" in session


def check_csrf():
    
    if request.path.startswith("/api"):
        return
    token_from_form = request.form.get("csrf_token")
    token_from_session = session.get("csrf_token")
    if not token_from_form or token_from_form != token_from_session:
        
        print(
            f"CSRF token mismatch: form token {token_from_form}, session token {token_from_session}")
        abort(403)


def require_role(role):
    """检查用户是否具有指定角色"""
    if not is_logged_in():
        print("User is not logged in.")  
    if user_role() < int(role):
        
        print(
            f"User does not have required role. Current role: {user_role()}, required role: {role}")
    if not is_logged_in() or user_role() < int(role):
        abort(403)


def get_current_user():
    """获取当前登录用户的信息"""
    if not is_logged_in():
        print("No user is logged in.") 
        return None
    print(f"Returning current user: {session.get('user_name')}")  
    return {
        "id": session.get("user_id"),
        "name": session.get("user_name"),
        "role": session.get("user_role")
    }
