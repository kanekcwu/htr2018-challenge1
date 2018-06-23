from flask import Flask
from flask_cors import CORS


def create_app(test_config=None):
    """Instantiate a Flask application"""
    app = Flask(__name__,
                instance_relative_config=True,
                static_url_path='/dashboard',
                static_folder='../dashboard/build/')
    cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.update(test_config)

    from app import dashboard
    app.register_blueprint(dashboard.bp)

    return app
