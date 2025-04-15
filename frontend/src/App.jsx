import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { UserProvider } from "./contexts/UserContext";
import Navbar from "./components/Navbar";
import AddCourse from "./pages/AddCourse";
import ActivityDetail from "./pages/ActivityDetail";
import MyActivities from "./pages/MyActivities";
import MyCourses from "./pages/MyCourses";
import TraineeStats from "./pages/TraineeStats";

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add" element={<AddCourse />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />
          <Route path="/my-activities" element={<MyActivities />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/my-stats" element={<TraineeStats />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
