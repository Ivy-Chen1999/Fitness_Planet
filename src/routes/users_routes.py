from flask import Blueprint, request, render_template, redirect, flash
import users

user_bp = Blueprint("user", __name__)


@user_bp.route("/login", methods=["GET", "POST"])
def login():
    if users.is_logged_in():
        flash("You already logged in.", "message")
        return redirect("/")

    if request.method == "GET":
        return render_template("login.html")

    username = request.form["username"]
    password = request.form["password"]
    if not users.login(username, password):
        flash("Wrong username or password.", "error")
        return redirect(request.referrer)

    flash("Login successful!", "success")
    return redirect("/")


@user_bp.route("/logout", methods=["POST"])
def logout():
    users.logout()
    flash("Logged out successfully!", "success")
    return redirect("/")


@user_bp.route("/register", methods=["GET", "POST"])
def register():
    if users.is_logged_in():
        flash("You already logged in.", "message")
        return redirect("/")

    if request.method == "GET":
        return render_template("register.html")

    username = request.form["username"]
    if len(username) < 1 or len(username) > 20:
        flash("Username should be 1-20 characters.", "error")
        return redirect(request.referrer)

    password1 = request.form["password1"]
    password2 = request.form["password2"]
    if password1 != password2:
        flash("Passwords do not match.", "error")
        return redirect(request.referrer)
    if len(password1) < 1 or len(password1) > 30:
        flash("Password should be 2-30 characters.", "error")
        return redirect(request.referrer)

    role = request.form["role"]
    if role not in ("1", "2"):
        flash("Invalid role!", "error")
        return redirect(request.referrer)

    result = users.register(username, password1, role)
    if result == "duplicate":
        flash("Username already exists.", "error")
        return redirect(request.referrer)
    if not result:
        flash("Registration failed, please try again.", "error")
        return redirect(request.referrer)

    flash("Registration successful! You are now logged in.", "success")
    return redirect("/")
