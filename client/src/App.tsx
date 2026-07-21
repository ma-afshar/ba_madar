import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import VerifyPhone from "./pages/VerifyPhone";
import Basket from "./pages/Basket";
import Admin from "./pages/Admin";
import Search from "./pages/Search";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/verify" element={<VerifyPhone />} />
        <Route path="/basket" element={<Basket />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/search" element={<Search />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
