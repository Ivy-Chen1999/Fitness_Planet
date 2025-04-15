from flask import Blueprint, jsonify
import users
import activity

coach_api = Blueprint("coach_api", __name__)


@coach_api.route("/activities", methods=["GET"])
def get_my_created_activities():
    users.require_role(2)
    coach_id = users.user_id()
    data = activity.get_my_activities(coach_id)
    return jsonify({"success": True, "data": data})
