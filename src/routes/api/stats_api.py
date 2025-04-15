from flask import Blueprint, jsonify
import users
import stats

stats_api = Blueprint("stats_api", __name__)


@stats_api.route("/trainee", methods=["GET"])
def get_trainee_stats():
    users.require_role(1)
    trainee_id = users.user_id()
    data = stats.get_trainee_stats(trainee_id)
    return jsonify({"success": True, "data": data})


@stats_api.route("/coach", methods=["GET"])
def get_coach_stats():
    users.require_role(2)
    coach_id = users.user_id()
    data = stats.get_coach_stats(coach_id)
    return jsonify({"success": True, "data": [dict(row) for row in data]})
