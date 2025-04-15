from flask import Blueprint, jsonify
import users
import activity

trainee_api = Blueprint("trainee_api", __name__)


@trainee_api.route("/activities", methods=["GET"])
def get_my_joined_activities():
    users.require_role(1)
    trainee_id = users.user_id()
    data = activity.get_my_participation(trainee_id)
    return jsonify({"success": True, "data": data})
