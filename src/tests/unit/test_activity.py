import unittest
from unittest.mock import patch, MagicMock
import activity


class TestActivityLogic(unittest.TestCase):

    @patch("activity.get_db_connection")
    def test_add_activity_success(self, mock_db_conn):
        mock_conn = MagicMock()
        mock_db_conn.return_value = mock_conn

        success = activity.add_activity(
            "Yoga", "Relax session", "2025-06-01T10:00", coach_id=1)
        self.assertTrue(success)
        mock_conn.execute.assert_called_once()

    @patch("activity.get_db_connection")
    def test_get_all_activities(self, mock_db_conn):
        mock_conn = MagicMock()
        mock_conn.execute.return_value.fetchall.return_value = [
            {"id": 1, "name": "Yoga", "time": "2025-06-01T10:00", "coach_name": "Coach"}
        ]
        mock_db_conn.return_value = mock_conn

        result = activity.get_all_activities()
        self.assertEqual(result[0]["name"], "Yoga")

    @patch("activity.get_db_connection")
    def test_check_activity_exists_true(self, mock_db_conn):
        mock_conn = MagicMock()
        mock_conn.execute.return_value.fetchone.return_value = {"id": 1}
        mock_db_conn.return_value = mock_conn

        exists = activity.check_activity_exists(1)
        self.assertTrue(exists)

    @patch("activity.get_db_connection")
    def test_check_activity_exists_false(self, mock_db_conn):
        mock_conn = MagicMock()
        mock_conn.execute.return_value.fetchone.return_value = None
        mock_db_conn.return_value = mock_conn

        exists = activity.check_activity_exists(999)
        self.assertFalse(exists)

    @patch("activity.get_db_connection")
    def test_join_activity_when_not_participated(self, mock_db_conn):
        mock_conn = MagicMock()
        mock_conn.execute.return_value.fetchone.side_effect = [  
            {"id": 1},
            None
        ]
        mock_db_conn.return_value = mock_conn

        result = activity.join_activity(activity_id=1, trainee_id=2)
        self.assertTrue(result)

    @patch("activity.get_db_connection")
    def test_add_review_success(self, mock_db_conn):
        mock_conn = MagicMock()
        mock_conn.execute.return_value.fetchone.side_effect = [
            {"id": 1},  # activity exists
            {"id": 1}   # participated
        ]
        mock_db_conn.return_value = mock_conn

        result = activity.add_review(
            activity_id=1, trainee_id=2, stars=5, comment="Great!")
        self.assertTrue(result)

    @patch("activity.get_db_connection")
    def test_add_review_fail_if_not_participated(self, mock_db_conn):
        mock_conn = MagicMock()
        mock_conn.execute.return_value.fetchone.side_effect = [
            {"id": 1},  # activity exists
            None        # not participated
        ]
        mock_db_conn.return_value = mock_conn

        result = activity.add_review(
            activity_id=1, trainee_id=2, stars=4, comment="Oops")
        self.assertFalse(result)
