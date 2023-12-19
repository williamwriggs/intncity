import * as React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./components/auth/Hooks";
import AppContainer from './components/AppContainer';
import Admin from './components/admin/Admin';
import Start from './components/Start';
import SignIn from './components/SignIn';
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/app" element={<AppContainer />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/start" element={<Start />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />        
        </Routes>    
      </BrowserRouter>
    </AuthProvider>
  );
}
