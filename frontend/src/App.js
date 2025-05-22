import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import InventoryPage from "./components/Inventory/InventoryPage";
import RequestsPage from "./components/Requests/RequestsPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<PrivateRoute role="admin"><InventoryPage /></PrivateRoute>}/>
                <Route path="/requests" element={<RequestsPage />} />
            </Routes>
        </Router>
    );
}

export default App;