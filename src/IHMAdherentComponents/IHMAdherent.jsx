import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import iconburger from "../assets/icons/menu.png";
import iconhome from "../assets/icons/home.png";
import ptlogo from "../assets/pictures/logo_1.png"

import arrow from "../assets/icons/arrow.png"

const IHMAdherent = () => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        console.log("Token supprimé");
    };

    const [userInfo, setUserInfo] = useState(null);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserInfo({
                nom: decodedToken.nom,
                prenom: decodedToken.prenom,
            });
        }
    }, []);

    return(
        <div className="adherentmain-supercontainer">
            <div className="adherentmain-container-left">
                <div className="adherentmain-ptlogo">
                    <img src={ptlogo} alt='' />
                </div>
                <div className="adherentmain-navbar">
                    <ul>
                        <li>
                            <div className="adherentmain-navbar-arvor">
                                <div className="adherentmain-navbar-arvor-title">
                                    <h2>Arvor</h2>
                                    <img src={arrow} alt="" />
                                </div>

                                <div className="adherentmain-subnavbar1">
                                    <ul>
                                        <li><Link to="/adherentresa" style={{ textDecoration: 'none' }}><h3>Réserver</h3></Link></li>
                                        <li><Link to="/carnetdebord" style={{ textDecoration: 'none' }}><h3>Carnet de Bord</h3></Link></li>
                                    </ul>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="adherentmain-logout">
                    <button onClick={handleLogout}><h2>Se Déconnecter</h2></button>
                </div>
            </div>

            <div className="adherentmain-container-right">
                <div className="adherentmain-top">
                    <div className="adherentmain-homelogo">
                    <img src={iconhome} alt=''/>
                    </div>

                    <div className="adherentmain-title">
                        <h1>Tableau de Bord Adhérent</h1>
                    </div>
                </div>
                <div className="adherentmain-middle">
                {userInfo && (
                    <div><h4>Bienvenue <span>{userInfo.prenom} {userInfo.nom}</span></h4>
                </div>
                )}
                    <div className="adherentmain-raccourcis">
                        <h2>Raccourcis</h2>
                        <ul>
                            <li className="raccourcis-item">
                                <Link to="/adherentresa" style={{ textDecoration: 'none'}}><h3>Réserver</h3></Link>
                            </li>
                            <li className="raccourcis-item">
                                <Link to="/carnetdebord" style={{ textDecoration: 'none'}}><h3>Carnet de Bord</h3></Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IHMAdherent;