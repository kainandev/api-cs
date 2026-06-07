import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home/home.jsx";
import Sobre from "./pages/about/about.jsx";
import EventDetails from "./pages/eventDetails/EventDetails.jsx";
import MyTickets from "./pages/myTickets/MyTickets.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import EditEvent from './pages/EventEdit/EditEvent';

export default function App() {
   return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/evento/:id" element={<EventDetails />} />
          <Route path="/meus-ingressos" element={<MyTickets />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/events/:id/edit" element={<EditEvent />}/>
        </Routes>
      </BrowserRouter>
   );
}
