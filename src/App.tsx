import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast/ToastContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from './components/Layout';
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

import Home from "./pages/Home";
import IngredientsPage from './components/IngredientsPage/IngredientsPage';
import RecipeDetailPage from './pages/RecipeDetail';
import "./global.css";


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
    <IngredientsPage />
  </PrivateRoute>
} />
<Route path="/recipe/:id" element={
  <PrivateRoute>
    <RecipeDetailPage />
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
