import pytest
import users
import activity
import db


@pytest.fixture
def app_ctx():
    from run import create_app
    app = create_app()
    app.secret_key = "testing"
    app.config["TESTING"] = True
    with app.app_context():
        yield app


def test_full_activity_flow(app_ctx):
    with app_ctx.test_request_context():
        assert users.register("coach01", "abc123", "2")
        coach_id = users.user_id()

        assert users.register("student1", "abc123", "1")
        trainee_id = users.user_id()

    
        users.logout()
        users.login("coach01", "abc123")  
        assert users.user_id() == coach_id

        success = activity.add_activity(
            "Core Training", "For abs", "2025-05-02T07:30", coach_id)
        assert success

        act_id = activity.get_all_activities()[0]["id"]

        
        users.logout()
        users.login("student1", "abc123")
        assert users.user_id() == trainee_id
        assert activity.join_activity(act_id, trainee_id)

        
        assert activity.mark_as_completed(act_id, trainee_id)

        
        assert activity.add_review(act_id, trainee_id, 5, "Great workout!")

        
        users.login("coach01", "abc123")
        assert activity.add_feedback(
            act_id, coach_id, trainee_id, "Keep it up!")

        
        users.login("student1", "abc123")
        feedback = activity.get_my_feedback(act_id, trainee_id)
        assert len(feedback) > 0
        assert "Keep it up" in feedback[0]["feedback"]
