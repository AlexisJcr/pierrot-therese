import React, { useState } from 'react';
import imageIdentifiant from "../assets/icons/user.png";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const adresse = process.env.REACT_APP_API_URL;

function Login(){
    //==== Gestion retour page vitrine =====//
    const navigate = useNavigate();
    const funcCancel = () => {navigate('/');};

    //==== Gestion du Formulaire =====//
    const [formData, setFormData] = useState({formemail: '', password: ''}); //Infos du form
    const funcChange = (e) => {setFormData({...formData,[e.target.name]: e.target.value});};

    const [errorMessage, setErrorMessage] = useState('');
    
    const funcSubmit = (e) => {
        e.preventDefault();
        axios.post(`${adresse}/login`, formData)
            .then(response => {
                const { token } = response.data;
                if (token) {
                    localStorage.setItem('token', token);
    
                    const decodedToken = jwtDecode(token);
                    const role = decodedToken.role;
    
                    if (role === 'adherent') {
                        navigate('/adherent');
                    } else if (role === 'administrateur') {
                        navigate('/administrateur');
                    } else {

                        console.log('Rôle non reconnu dans le token');
                    }
                }
            })
            .catch(error => {
                console.log(error);
                if (error.response) {
                    setErrorMessage(error.response.data.message);
                } else {
                    setErrorMessage('Erreur lors de la requête POST');
                }
            });
    };

    return(
        <div className="login-page" id="LoginPage">
            <div className="login-super-container">
                <div className="login-image-container">
                </div>

                <div className="login-form-container">
                    <div className="login-title">
                        <h1>Se Connecter</h1>
                    </div>
                    <div className="login-img">
                        <img src={imageIdentifiant} alt=''/>
                    </div>

                    <div className="form-container">
                        <form onSubmit={funcSubmit}> 
                            <div className="form-inputs">                              
                                <input type="text" id="formemail" name="formemail" placeholder="Identifiant" value={formData.formemail} onChange={funcChange}/>
                                <input type="password" id="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={funcChange}/>
                            </div>
                            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>} 
                            <div className="form-buttons">
                                <button className="button-cancel" onClick={funcCancel}>Annuler</button>
                                <button type="submit" className="button-valid">Se connecter</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
