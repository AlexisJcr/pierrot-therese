import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import Vitrine from './vitrine_component/Vitrine';

import PageLogin from './login_component/Login';

// ===== IHM Admin ====//
import IHMAdmin from './IHMAdminComponents/IHMAdmin';
import Geolocation from './IHMAdminComponents/Geoloca';
import Intrusion from './IHMAdminComponents/Intrusion';

import AccountManager from './IHMAdminComponents/AccountManager';
import BDDManager from './IHMAdminComponents/BDDManager';

import NousRejoindre from './vitrine_component/NousRejoindre';

// ===== CMS =====//
import GestionCalendar from './IHMAdminComponents/CMS/GestionCalendar';

// ===== IHMAdherent ===== //
import IHMAdherent from './IHMAdherentComponents/IHMAdherent';
import AdherentResa from './IHMAdherentComponents/AdherentResa';
import CarnetdeBord from './IHMAdherentComponents/CarnetdeBord';

//Fonction de protection de route permettant d'accueillir une seule permission
function ProtectedRoute({ element, permission }) {
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null; 

  if (token && decodedToken && decodedToken.role === permission) { 
    return element;
  } else {
    localStorage.removeItem('token'); 
    return <Navigate to="/login" />; //Si la permission n'est pas correcte, l'utilisateur est retourné sur la page de login
  }
}

//Fonction de protection de route permettant d'accueillir deux permissions
function ProtectedRoute2({ element, permission1, permission2 }) {
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null;

  if (token && decodedToken && decodedToken.role === permission1 || token && decodedToken && decodedToken.role === permission2) { 
    return element;
  } else {
    localStorage.removeItem('token'); 
    return <Navigate to="/login" />; 
  }
}

function App() { //Hub du site avec les redirections vers les différentes pages
  return (
    <Router>
      <Routes>
        {/*Vitrine*/}
        <Route path="/" element={<Vitrine />} />
        <Route path="/nousrejoindre" element={<NousRejoindre />} />
        <Route path="/login" element={<PageLogin />} />
        {/*IHMAdmin*/}
        <Route path="/administrateur" element={<ProtectedRoute element={<IHMAdmin />} permission="administrateur" />} />

        <Route path="/geolocation" element={<ProtectedRoute element={<Geolocation />} permission="administrateur" />} />
        <Route path="/intrusion" element={<ProtectedRoute element={<Intrusion />} permission="administrateur" />} />

        <Route path='/accountmanager' element={<ProtectedRoute element={<AccountManager />} permission="administrateur" />} />
        <Route path='/bddmanager' element={<ProtectedRoute element={<BDDManager />} permission="administrateur" />} />
        <Route path='/gestioncalendrier' element={<ProtectedRoute element={<GestionCalendar />} permission="administrateur" />} />
        {/*IHMAdherent*/}
        <Route path='/adherent' element={<ProtectedRoute element={<IHMAdherent />} permission="adherent" />} />
        <Route path='/carnetdebord' element={<ProtectedRoute2 element={<CarnetdeBord />} permission1="administrateur" permission2="adherent" />} />
        <Route path='/adherentresa' element={<ProtectedRoute2 element={<AdherentResa />} permission1="administrateur" permission2="adherent" />} />
      </Routes>
    </Router>
  );
}

const root = document.getElementById('root');
const reactRoot = ReactDOM.createRoot(root);
reactRoot.render(<App />);
