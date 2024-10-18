import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import cdblogo from "../assets/icons/manageaccount.png";

const CarnetdeBord = () => {
    const [carnetEntries, setCarnetEntries] = useState([]);

    const location = useLocation();
    const [description, setDescription] = useState('');
    const [idBateau] = useState(new URLSearchParams(location.search).get('idBateau'));
    const [idResa] = useState(new URLSearchParams(location.search).get('idResa'));

    const [errorMessage, setErrorMessage] = useState('');
    const [validMessage, setValidMessage] = useState('');

    //Decoder USERID du token JWT
    const getUserID = () => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            return decodedToken.idUtilisateur;
        }
        return null;
    };

    //Decoder Permission du token JWT
    const getPermission = () => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            return decodedToken.role;
        }
        return null;
    }

    const userPermission = getPermission();

    const getLink = () => {
        return userPermission === 'administrateur' ? "/administrateur" : "/adherent";
    };

    const adresse = process.env.REACT_APP_API_URL;

    useEffect(() => {
        axios.get(`${adresse}/carnetdebord/1`)
            .then(response => {
                console.log(response.data);
                setCarnetEntries(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération du carnet de bord:', error);
            });
    }, []);

    const FuncDescChange = (event) => { //Renseignement de la description du carnet de bord
        setDescription(event.target.value);
    };

    const FuncSave = () => {
        if (!description) { //Vérifie si l'utilisateur à bien renseigné la partie description
            setErrorMessage('La description est obligatoire');
            return;
        }

        axios.post(`${adresse}/carnetdebord`, { idResa, idBateau, description }) //Transmet les informations au serveur
            .then(response => {
                setValidMessage("Carnet renseigné pour cette réservation");
                console.log('Nouvelle entrée ajoutée dans le carnet de bord.');
            })
            .catch(error => {
                console.error('Erreur lors de l\'ajout de l\'entrée dans le carnet de bord :', error);
                setErrorMessage('Erreur lors de la sauvegarde, le carnet existe peut-être déjà');
            });
    };

    return (
        <div className="cdb-supercontainer">
            <div className="common-header">
                <div className="common-logo">
                    <img src={cdblogo} alt="" />
                    <h1>Carnet de Bord</h1>
                </div>

                <div className="common-navbar">
                    <ul>
                        <li><Link to={getLink()} style={{ textDecoration: 'none' }}><h2>Retour au Tableau de Bord</h2></Link></li>
                    </ul>
                </div>
            </div>
            <div className='cdb-container'>
                <div className='cdb-form'>
                    <h2>Remplir le Carnet de Bord</h2>
                    <form>
                        <div className='cdb-form-item'>
                            <label>idBateau: </label>
                            <input type="text" value={idBateau} disabled />
                        </div>
                        <div className='cdb-form-item'>
                            <label>idResa: </label>
                            <input type="text" value={idResa} disabled />
                        </div>
                        <div className='cdb-form-item'>
                            <label>Description: </label>
                            <textarea value={description} onChange={FuncDescChange} />
                        </div>
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                        {validMessage && <p style={{ color: 'green' }}>{validMessage}</p>}
                        <button type="button" onClick={FuncSave}>Sauvegarder</button>
                    </form>
                </div>

                <h2>Carnet de Bord du Bateau Arvor</h2>
                <div className='cdb-table'>
                    <table>
                        <thead>
                            <tr>
                                <th>idResa</th>
                                <th>idBateau</th>
                                <th>Date</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carnetEntries.map((carnet, index) => (
                                <tr key={index}>
                                    <td>{carnet.idResa}</td>
                                    <td>{carnet.idBateau}</td>
                                    <td>{carnet.date}</td>
                                    <td>{carnet.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CarnetdeBord;
