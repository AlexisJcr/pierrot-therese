import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import io from 'socket.io-client';

import iconhome from "../assets/icons/home.png";
import ptlogo from "../assets/pictures/logo_1.png"

import arrow from "../assets/icons/arrow.png"

const IHMAdmin = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        console.log("Token supprimé");
    };

    const socket = useRef(null);
    const [boatStatus, setBoatStatus] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const adresse = process.env.REACT_APP_API_URL;

    useEffect(() => {
        socket.current = io(`${adresse}`);

        socket.current.on('locaBoatStatus', (status) => {
            if (status) {
                setBoatStatus('Dans la zone');
            } else {
                setBoatStatus('En dehors de la zone');
            }
        });

        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserInfo({
                nom: decodedToken.nom,
                prenom: decodedToken.prenom,
            });
        }
    }, []);

    return (
        <div className="adminmain-supercontainer">
            <div className="adminmain-container-left">
                <div className="adminmain-ptlogo">
                    <img src={ptlogo} alt='' />
                </div>
                <div className="adminmain-navbar">
                    <ul>
                        <li>
                            <div className="adminmain-navbar-gesite">
                                <div className="adminmain-navbar-gesite-title">
                                    <h2>Gestion Site</h2>
                                    <img src={arrow} alt="" />
                                </div>
                                <div className="adminmain-subnavbar1">
                                    <ul>
                                        <li><Link to="/accountmanager" style={{ textDecoration: 'none' }}><h3>Gestionnaire de Comptes</h3></Link></li>
                                        <li><Link to="/bddmanager" style={{ textDecoration: 'none' }}><h3>Gestionnaire Base de Données</h3></Link></li>
                                        <li><Link to="/gestioncalendrier" style={{ textDecoration: 'none' }}><h3>Gestionnaire Contenu</h3></Link></li>
                                    </ul>
                                </div>
                            </div>
                        </li>

                        <li>
                            <div className="adminmain-navbar-interface">
                                <div className="adminmain-navbar-interface-title">
                                    <h2>Interface</h2>
                                    <img src={arrow} alt="" />
                                </div>

                                <div className="adminmain-subnavbar2">
                                    <ul>
                                        <li><Link to="/geolocation" style={{ textDecoration: 'none' }}><h3>Géolocalisation</h3></Link></li>
                                        <li><Link to="/intrusion" style={{ textDecoration: 'none' }}><h3>Intrusion</h3></Link></li>
                                    </ul>
                                </div>
                            </div>
                        </li>

                        <li>
                            <div className="adminmain-navbar-meteo">
                                <div className="adminmain-navbar-meteo-title">
                                    <h2>Météo</h2>
                                    <img src={arrow} alt="" />
                                </div>


                                <div className="adminmain-subnavbar3">
                                    <ul>
                                        <li><Link to="/mesures" style={{ textDecoration: 'none' }}><h3>Mesures</h3></Link></li>
                                        <li><Link to="/graphiques" style={{ textDecoration: 'none' }}><h3>Graphiques</h3></Link></li>
                                    </ul>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="adminmain-navbar-arvor">
                                <div className="adminmain-navbar-arvor-title">
                                    <h2>Arvor</h2>
                                    <img src={arrow} alt="" />
                                </div>

                                <div className="adminmain-subnavbar4">
                                    <ul>
                                        <li><Link to="/adherentresa" style={{ textDecoration: 'none' }}><h3>Réserver</h3></Link></li>
                                        <li><Link to="/carnetdebord" style={{ textDecoration: 'none' }}><h3>Carnet de Bord</h3></Link></li>
                                    </ul>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="adminmain-logout">
                    <button onClick={handleLogout}><h2>Se Déconnecter</h2></button>
                </div>
            </div>

            <div className="adminmain-container-right">
                <div className="adminmain-top">
                    <div className="adminmain-homelogo">
                        <img src={iconhome} alt='' />
                    </div>

                    <div className="adminmain-title">
                        <h1>Tableau de Bord Administrateur</h1>
                    </div>
                </div>
                <div className="adminmain-middle">
                    {userInfo && (
                        <div><h4>Bienvenue <span>{userInfo.prenom} {userInfo.nom}</span></h4>
                        </div>
                    )}
                    <div className="adminmain-raccourcis">
                        <h2>Raccourcis</h2>
                        <ul>
                            <li className="raccourcis-item">
                                <Link to="/geolocation" style={{ textDecoration: 'none' }}><h3>Localisation</h3></Link>
                            </li>
                            <li className="raccourcis-item">
                                <Link to="/accountmanager" style={{ textDecoration: 'none' }}><h3>Utilisateurs</h3></Link>
                            </li>
                            <li className="raccourcis-item">
                                <Link to="/gestioncalendrier" style={{ textDecoration: 'none' }}><h3>CMS</h3></Link>
                            </li>
                        </ul>
                    </div>
                    <div className="adminmain-boatstat">
                        <h2>Status Bateau : {boatStatus}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IHMAdmin;
