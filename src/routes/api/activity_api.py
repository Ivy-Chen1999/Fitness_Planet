from flask import Blueprint, request, jsonify
import users
import activity

activity_api = Blueprint("activity_api", __name__)


@activity_api.route("/", methods=["GET"])
def list_activities():
    data = activity.get_all_activities()
    return jsonify({"success": True, "data": data})


@activity_api.route("/<int:activity_id>", methods=["GET"])
def activity_detail(activity_id):
    info = activity.get_activity_info(activity_id)
    if not info:
        return jsonify({"success": False, "message": "Activity not found"}), 404

    participation = activity.get_participation(activity_id)
    reviews = activity.get_reviews(activity_id)

    response = {
        "info": info,
        "participation": participation,
        "reviews": reviews,
    }

    user = users.get_current_user()
    if user:
        if user["role"] == 1:
            response["feedback"] = activity.get_my_feedback(
                activity_id, user["id"])
        if user["role"] == 2:
            response["can_feedback"] = activity.check_coach_permission(
                activity_id, user["id"])

    return jsonify({"success": True, "data": response})


@activity_api.route("/", methods=["POST"])
def create_activity():
    users.require_role(2)
    data = request.get_json()
    name = data.get("name")
    description = data.get("description")
    time = data.get("time")
    coach_id = users.user_id()
    user = users.get_current_user()
    if user["role"] != 2:
        return jsonify({"success": False, "message": "Unauthorized: Insufficient role"}), 403

    if not name or not description or not time:
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    if not activity.add_activity(name, description, time, coach_id):
        return jsonify({"success": False, "message": "Failed to create activity"}), 500

    return jsonify({"success": True, "message": "Activity created"}), 201


@activity_api.route("/<int:activity_id>", methods=["DELETE"])
def delete_activity(activity_id):
    users.require_role(2)
    coach_id = users.user_id()

    if not activity.remove_activity(activity_id, coach_id):
        return jsonify({"success": False, "message": "Delete failed or permission denied"}), 400

    return jsonify({"success": True, "message": "Activity deleted"})


@activity_api.route("/<int:activity_id>/join", methods=["POST"])
def join_activity(activity_id):
    users.require_role(1)
    users.check_csrf()
    if not activity.join_activity(activity_id, users.user_id()):
        return jsonify({"success": False, "message": "Already joined or not allowed"}), 400
    return jsonify({"success": True, "message": "Joined successfully"})


@activity_api.route("/<int:activity_id>/complete", methods=["POST"])
def mark_as_completed(activity_id):
    users.require_role(1)
    users.check_csrf()
    if not activity.mark_as_completed(activity_id, users.user_id()):
        return jsonify({"success": False, "message": "Not participated or not allowed"}), 400
    return jsonify({"success": True, "message": "Marked as completed"})


@activity_api.route("/<int:activity_id>/review", methods=["POST"])
def add_review(activity_id):
    users.require_role(1)
    users.check_csrf()
    data = request.get_json()
    stars = data.get("stars")
    comment = data.get("comment")

    if not isinstance(stars, int) or not (1 <= stars <= 5):
        return jsonify({"success": False, "message": "Invalid stars"}), 400
    if comment and len(comment) > 1000:
        return jsonify({"success": False, "message": "Comment too long"}), 400

    if not activity.add_review(activity_id, users.user_id(), stars, comment):
        return jsonify({"success": False, "message": "Cannot review"}), 400

    return jsonify({"success": True, "message": "Review submitted"})


@activity_api.route("/<int:activity_id>/feedback", methods=["POST"])
def add_feedback(activity_id):
    users.require_role(2)
    users.check_csrf()
    data = request.get_json()
    trainee_id = data.get("trainee_id")
    feedback_text = data.get("feedback")

    if not activity_id or not trainee_id or not feedback_text:
        return jsonify({"success": False, "message": "All fields are required"}), 400
    if len(feedback_text) < 1 or len(feedback_text) > 1000:
        return jsonify({"success": False, "message": "Feedback length invalid"}), 400

    coach_id = users.user_id()
    if not activity.add_feedback(activity_id, coach_id, trainee_id, feedback_text):
        return jsonify({"success": False, "message": "Not allowed or failed to add"}), 400

    return jsonify({"success": True, "message": "Feedback submitted"})
