from flask import Blueprint, request, jsonify
import users

auth_api = Blueprint("auth_api", __name__)


@auth_api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    name = data.get("name")
    password = data.get("password")

    if not name or not password:
        return jsonify({"success": False, "message": "Name and password are required"}), 400

    if not users.login(name, password):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    user = users.get_current_user() 
    return jsonify({"success": True, "data": user})


@auth_api.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    password = data.get("password")
    role = data.get("role")

    if not name or not password or role not in ("1", "2"):
        return jsonify({"success": False, "message": "Invalid input"}), 400

    result = users.register(name, password, role)
    if result == "duplicate":
        return jsonify({"success": False, "message": "Username already exists"}), 409
    if not result:
        return jsonify({"success": False, "message": "Registration failed"}), 500

    user = users.get_current_user() 
    return jsonify({"success": True, "data": user})


@auth_api.route("/logout", methods=["POST"])
def logout():
    users.logout()
    return jsonify({"success": True, "message": "Logged out"})


@auth_api.route("/me", methods=["GET"])
def get_current_user():
    user = users.get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    return jsonify({"success": True, "data": user})
