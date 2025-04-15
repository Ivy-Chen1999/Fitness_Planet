from flask import Blueprint, render_template
import users
import stats

stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/stats/trainee")
def trainee_stats():
    users.require_role(1)
    trainee_id = users.user_id()
    stats_data = stats.get_trainee_stats(trainee_id)
    return render_template(
        "trainee_stats.html",
        summary=stats_data["summary"],
        participation=stats_data["details"],
        hide_login_register=True
    )


@stats_bp.route("/stats/coach")
def coach_stats():
    users.require_role(2)
    stats_data = stats.get_coach_stats(users.user_id())
    return render_template("coach_stats.html", stats=stats_data, hide_login_register=True)
