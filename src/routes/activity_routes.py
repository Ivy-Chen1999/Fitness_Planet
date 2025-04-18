from flask import Blueprint, render_template, request, redirect, flash
from datetime import datetime
import activity
import users

activity_bp = Blueprint("activity", __name__)


@activity_bp.route("/")
def index():
    logged_in = users.is_logged_in()
    user_role = users.user_role() if logged_in else 0
    return render_template("index.html", activities=activity.get_all_activities(), user_role=user_role)


@activity_bp.route("/add", methods=["GET", "POST"])
def add_activity():
    users.require_role(2)

    if request.method == "GET":
        current_time = datetime.now().strftime("%Y-%m-%dT%H:%M")
        return render_template("add_activity.html", current_time=current_time)

    users.check_csrf()
    name = request.form["name"]
    if len(name) < 1 or len(name) > 50:
        flash("Course name should be 1-50 characters.", "message")
        return redirect(request.referrer)
    description = request.form["description"]
    if len(description) < 1 or len(description) > 200:
        flash("Description should be 1-200 characters.", "message")
        return redirect(request.referrer)
    time = request.form["time"]
    coach_id = users.user_id()
    activity.add_activity(name, description, time, coach_id)
    flash("Course added successfully!", "success")
    return redirect("/")


@activity_bp.route("/remove", methods=["GET", "POST"])
def remove_activity():
    users.require_role(2)

    if request.method == "GET":
        my_activities = activity.get_my_activities(users.user_id())
        return render_template("remove_activity.html", activities=my_activities)

    users.check_csrf()
    activity_id = request.form["activity_id"]
    if not activity.remove_activity(activity_id, users.user_id()):
        flash("Failed to remove activity. It may not exist or you don't have permission.", "error")
        return redirect(request.referrer)
    flash("Course successfully deleted!", "success")
    return redirect("/")


@activity_bp.route("/activity/<int:activity_id>")
def show_activity(activity_id):
    if not users.is_logged_in():
        flash("Please log in to view activity details.", "message")
        return redirect("/login")
    info = activity.get_activity_info(activity_id)
    if not info:
        flash("The requested activity does not exist.", "error")
        return redirect("/")
    participation = activity.get_participation(activity_id)
    reviews = activity.get_reviews(activity_id)

    feedback = None
    can_feedback = False
    if users.user_role() == 1:
        feedback = activity.get_my_feedback(activity_id, users.user_id())
    if users.user_role() == 2:
        can_feedback = activity.check_coach_permission(
            activity_id, users.user_id())

    return render_template("activity.html", info=info, participation=participation,
                           reviews=reviews, feedback=feedback, can_feedback=can_feedback)


@activity_bp.route("/join", methods=["POST"])
def join_activity():
    users.require_role(1)
    users.check_csrf()

    activity_id = request.form["activity_id"]
    if not activity.join_activity(activity_id, users.user_id()):
        flash("You already joined this activity.", "message")
        return redirect(request.referrer)

    flash("Successfully joined the activity!", "success")
    return redirect(f"/activity/{activity_id}")


@activity_bp.route("/complete", methods=["POST"])
def mark_as_completed():
    users.require_role(1)
    users.check_csrf()

    activity_id = request.form["activity_id"]
    if not activity.mark_as_completed(activity_id, users.user_id()):
        flash("Ensure you participated in the activity.", "message")
        return redirect(request.referrer)
    flash("Activity marked as completed successfully!", "success")
    return redirect(f"/activity/{activity_id}")


@activity_bp.route("/review", methods=["POST"])
def add_review():
    users.require_role(1)
    users.check_csrf()

    activity_id = request.form["activity_id"]
    stars = int(request.form["stars"])
    if not 1 <= stars <= 5:
        flash("Invalid rating. Please enter a number between 1 and 5.", "error")
        return redirect(request.referrer)
    comment = request.form["comment"]
    if len(comment) > 1000:
        flash("Review comment is too long.", "error")
        return redirect(request.referrer)
    if not activity.add_review(activity_id, users.user_id(), stars, comment):
        flash("Failed to add review. Ensure you participated in the activity or haven't reviewed already.", "error")
        return redirect(request.referrer)
    flash("Review added successfully!", "success")
    return redirect(f"/activity/{activity_id}")


@activity_bp.route("/feedback", methods=["POST"])
def add_feedback():
    users.require_role(2)
    users.check_csrf()

    activity_id = request.form["activity_id"]
    trainee_id = request.form["trainee_id"]
    feedback = request.form["feedback"]

    if not activity_id or not trainee_id or not feedback:
        flash("All fields are required.", "error")
        return redirect(request.referrer)
    if len(feedback) < 1 or len(feedback) > 1000:
        flash("Feedback must be between 1-1000 characters.", "message")
        return redirect(request.referrer)
    coach_id = users.user_id()
    if not activity.add_feedback(activity_id, coach_id, trainee_id, feedback):
        flash("Failed to add feedback. Make sure you have permission.", "error")
        return redirect(request.referrer)
    flash("Feedback added successfully!", "success")
    return redirect(f"/activity/{activity_id}")
