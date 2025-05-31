import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast/ToastContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from './components/Layout';
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

import Home from "./pages/Home";
import IngredientsPage from './components/IngredientsPage/IngredientsPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CalendarPage from "./pages/CalendarPage";
import "./global.css";
import Navbar from "./components/Navbar/Navbar";


function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>

             <Route index element={<Home />} />
            
<Route path="/ingredients" element={
  <PrivateRoute>
    <Navbar/>
    <IngredientsPage />
  </PrivateRoute>
} />
<Route path="/recipe/:id" element={
  <PrivateRoute>
        <Navbar/>
    <RecipeDetailPage />
  </PrivateRoute>
} />
<Route path="/calendar" element={
  <PrivateRoute>
        <Navbar/>
<CalendarPage />
  </PrivateRoute>
} />
     



            </Route>           
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
