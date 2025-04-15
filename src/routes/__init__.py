from routes.api.auth_api import auth_api
from routes.api.activity_api import activity_api
from routes.api.coach_api import coach_api
from routes.api.trainee_api import trainee_api
from routes.api.stats_api import stats_api


def register_routes(app):
    app.register_blueprint(auth_api, url_prefix="/api/auth")
    app.register_blueprint(activity_api, url_prefix="/api/activities")
    app.register_blueprint(coach_api, url_prefix="/api/coach")
    app.register_blueprint(trainee_api, url_prefix="/api/trainee")
    app.register_blueprint(stats_api, url_prefix="/api/stats")
