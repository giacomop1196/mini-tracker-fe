import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginComponent from './components/LoginComponent';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterComponent from './components/RegisterComponent';
import NavbarComponent from './components/NavbarComponent';
import AggiungiEntrataComponent from './components/AggiungiEntrataComponent';
import EntrateListComponent from './components/EntrateListComponent';
import UsciteListComponent from './components/UsciteListComponent';
import AggiungiUscitaComponent from './components/AggiungiUscitaComponent';
import ProfiloUtenteComponent from './components/ProfiloUtenteComponent';
import ModificaProfiloComponent from './components/ModificaProfiloComponent';


function App() {
  const [authToken, setAuthToken] = useState(
    localStorage.getItem('authToken') || null
  );

  const handleLogin = (token) => {
    localStorage.setItem('authToken', token);
    setAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
  };

  return (
    <>
      {/* Se il token esiste mostriamo la navbar e gli passiamo la funzione di logout */}
      {authToken && <NavbarComponent onLogout={handleLogout} />}
      <Routes>

        {/* Route Pubbliche */}
        <Route path="/register" element={<RegisterComponent />} />

        {/* Pagina di Login */}
        <Route
          path="/login"
          element={
            authToken ? (
              // Se l'utente è GIÀ loggato, lo reindirizzo ad una pagina
              <Navigate to="/" replace />
            ) : (
              // Altrimenti mostro il componente di login
              <LoginComponent onLoginSuccess={handleLogin} />
            )
          }
        />

        {/* --- Route Protette --- */}
        <Route path="/entrate/aggiungi" element={
          <ProtectedRoute token={authToken}>
            <AggiungiEntrataComponent />
          </ProtectedRoute>
        } />
        <Route path="/entrate" element={
          <ProtectedRoute token={authToken}>
            <EntrateListComponent />
          </ProtectedRoute>
        } />

        <Route path="/uscite" element={
          <ProtectedRoute token={authToken}>
            <UsciteListComponent />
          </ProtectedRoute>
        } />
        <Route path="/uscite/aggiungi" element={
          <ProtectedRoute token={authToken}>
            <AggiungiUscitaComponent />
          </ProtectedRoute>
        } />

        <Route path="/profilo" element={
          <ProtectedRoute token={authToken}>
            <ProfiloUtenteComponent />
          </ProtectedRoute>
        } />
        <Route path="/profilo/modifica" element={
          <ProtectedRoute token={authToken}>
            <ModificaProfiloComponent />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default App
