from invoke import task
import os

@task
def run(ctx, port=5000):
    os.environ["FLASK_ENV"] = "development"
    ctx.run("poetry run python src/run.py", pty=True)

@task
def init_db(ctx):
    ctx.run("PYTHONPATH=src poetry run python -c 'from db import init_db; init_db()'", pty=True)

@task
def test(ctx):
    """运行全部测试"""
    ctx.run("poetry run pytest src/tests", pty=True)

@task
def format(ctx):  # pylint: disable=redefined-builtin
    ctx.run("autopep8 --in-place --recursive src", pty=True)