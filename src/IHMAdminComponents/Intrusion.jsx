import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

import intrulogo from "../assets/icons/geolocation.png"

const Intrusion = () => {
    const [intrusionDetected, setIntrusionDetected] = useState(false);
    const [intrusionValue, setIntrusionValue] = useState(null);
    const [intrusionMessage, setIntrusionMessage] = useState("Pas d'intrusion détectée");

    const adresse = process.env.REACT_APP_API_URL;

    const SimulateIntrusion = async (e) => {
        const isChecked = e.target.checked;
        try {
            await axios.post(`${adresse}/intrusion`, { intrusion: isChecked });
        } catch (error) {
            console.error('Erreur lors de la simulation de l\'intrusion:', error);
        }
    };

    useEffect(() => {
        const socket = io(`${adresse}`);
        socket.on('simuintrusion', (intrusionValue) => {
            setIntrusionValue(intrusionValue);
            if (intrusionValue === 'true') {
                setIntrusionMessage("Intrusion détectée");
            } else {
                setIntrusionMessage("Pas d'intrusion détectée");
            }
        });
        return () => socket.disconnect();
    }, []);

    return (
        <div className="geoloca-supercontainer">
            <div className="common-header">
                <div class="common-logo">
                    <img src={intrulogo} alt="" />
                    <h1>Localisation</h1>
                </div>

                <div className="common-navbar">
                    <ul>
                        <li><Link to="/administrateur" style={{ textDecoration: 'none' }}><h2>Retour au Tableau de Bord</h2></Link></li>
                    </ul>
                </div>
            </div>

            <div className="intrusion-container">
                <label>
                    <input type="checkbox" onChange={SimulateIntrusion} />
                    Simuler l'intrusion
                </label>
                <div>
                    <h2>État de l'intrusion :</h2>
                    <p>{intrusionMessage}</p>
                </div>
            </div>
            
        </div>
    );
};

export default Intrusion;
