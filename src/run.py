import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from routes import register_routes

load_dotenv()


def create_app():
    app = Flask(
        __name__,
        static_folder=os.path.join(
            os.path.dirname(__file__), "frontend", "dist"),
        static_url_path=""
    )
    CORS(app, supports_credentials=True)
    app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "changeme")
    register_routes(app)

   
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        static_folder = app.static_folder
        full_path = os.path.join(static_folder, path)
        if path and os.path.exists(full_path):
            return send_from_directory(static_folder, path)
        return send_from_directory(static_folder, "index.html")

    return app



app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
