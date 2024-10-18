import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import boatIcon from '../assets/icons/boat.png';

import io from 'socket.io-client';

import ptlogo from "../assets/icons/geolocation.png"

const Geolocation = () => {
  const socket = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [zoneLat, setZoneLat] = useState(0);
  const [zoneLng, setZoneLng] = useState(0);
  const [initialZoneLat, setInitialZoneLat] = useState(0);
  const [initialZoneLng, setInitialZoneLng] = useState(0);

  const [markerCoordinates, setMarkerCoordinates] = useState({ latitude: 0, longitude: 0 });
  const [userCursorCoordinates, setUserCursorCoordinates] = useState({ latitude: 0, longitude: 0 });
  const [boatStatus, setBoatStatus] = useState('');

  const adresse = process.env.REACT_APP_API_URL;

  const updateZoneCoordinates = async () => {
    try {
      const response = await axios.get(`${adresse}/geolocazone`);
      setZoneLat(response.data.latitude);
      setZoneLng(response.data.longitude);
      setInitialZoneLat(response.data.latitude);
      setInitialZoneLng(response.data.longitude);
      //console.log("Valeurs reçues pour la zone :", [response.data.latitude, response.data.longitude]);
      if (circleRef.current) {
        circleRef.current.setLatLng([response.data.latitude, response.data.longitude]);
      }
    } catch (error) {
      console.error('Erreur de mise à jour de la zone', error);
    }
  };

  useEffect(() => {
    updateZoneCoordinates();
    //console.log("Valeur initiales ",[initialZoneLat,initialZoneLng])
    socket.current = io(`${adresse}`); //Connexion au socketio du serveur

    if (!mapRef.current) {
      socket.current.on('connect', () => {
        console.log('Connecté à SocketIO');
      });
      socket.current.on('disconnect', () => {
        console.log('Déconnecté de SocketIO');
      });

      const map = L.map('map').setView([48.40962, -4.48768], 12); //Initialisation de la vue de la carte sur Brest avec un zoom de 14
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { //Définition de la carte OpenStreetMap
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapRef.current = map; //Affichage de la carte openstreetmap
    }

    mapRef.current.on('mousemove', (e) => { //Récupère les coordonnées de la souris de l'utilisateur sur la carte pour un affichage en temps réel
      setUserCursorCoordinates({ latitude: e.latlng.lat.toFixed(5), longitude: e.latlng.lng.toFixed(5) }); 
    });

    socket.current.on('location', (location) => { 
      console.log("Coordonnées reçues sur le client : ", location);
      setMarkerCoordinates({ latitude: location.latitude, longitude: location.longitude }); //Mise à jour des coordonnées du marker
      if (markerRef.current) { //Si un marker existe déjà
        const popupContent = `Position de l'Arvor : <br>Latitude: ${location.latitude}<br>Longitude: ${location.longitude}`;
        markerRef.current.setLatLng([location.latitude, location.longitude]).bindPopup(popupContent);
      } else { //Première création de marker
        const Icon = L.icon({ //Définition de l'icon de bateau
          iconUrl: boatIcon,
          iconSize: [64, 64],
          iconAnchor: [32, 32]
        });
        //Description du marker
        const popupContent = `Position de l'Arvor : <br>Latitude: ${location.latitude}<br>Longitude: ${location.longitude}`;

        markerRef.current = L.marker([location.latitude, location.longitude], { icon: Icon })
          .addTo(mapRef.current) //Ajout du marker du bateau au coordonnées précisées
          .bindPopup(popupContent); //Ajout de la description du marker
      }
    });

    socket.current.on('locaBoatStatus', (status) => {
      if (status) {
        setBoatStatus('Dans la zone');
        const geocontainer = document.getElementById('geoloca-container');
        const geosupercontainer = document.getElementById('geoloca-supercontainer');
        geocontainer.style.backgroundColor = '#EDF2F6';
        geosupercontainer.style.backgroundColor = '#DDE7EF';
      } else {
        setBoatStatus('En dehors de la zone');
        const geocontainer = document.getElementById('geoloca-container');
        const geosupercontainer = document.getElementById('geoloca-supercontainer');
        geocontainer.style.backgroundColor = '#DC0000';
        geosupercontainer.style.backgroundColor = '#C40000';
      }
    });

    circleRef.current = L.circle([initialZoneLat, initialZoneLng], {
      color: '#077cbf',
      fillColor: '#09b4cb',
      fillOpacity: 0.4,
      radius: 150
    }).addTo(mapRef.current); //ajout du cercle sur la carte

    return () => {
      socket.current.disconnect();
      mapRef.current.removeLayer(circleRef.current);
    };

  }, [adresse, initialZoneLat, initialZoneLng]);

  const updateZone = async () => {
    try {
      await axios.post(`${adresse}/geolocazone`, { latitude: zoneLat, longitude: zoneLng });
      setInitialZoneLat(zoneLat);
      setInitialZoneLng(zoneLng);
      if (circleRef.current) {
        circleRef.current.setLatLng([zoneLat, zoneLng]);
      }
      console.log('POST : Zone mise à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la zone:', error);
    }
  };

  const simulateCoord = async (e) => {
    try {
      await axios.post(`${adresse}/simugeoloca`, { latitude, longitude });
      console.log('Simlation envoyée');
    } catch (error) {
      console.error('Erreur de simulation:', error);
    }
  };

  return (
    <div className="geoloca-supercontainer" id="geoloca-supercontainer">
      <div className="common-header">
        <div className="common-logo">
          <img src={ptlogo} alt="" />
          <h1>Localisation</h1>
        </div>

        <div className="common-navbar">
          <ul>
            <li><Link to="/administrateur" style={{ textDecoration: 'none' }}><h2>Retour au Tableau de Bord</h2></Link></li>
          </ul>
        </div>

        <div className="geoloca-header-coord">
          <h2>Coordonnées du Bateau : {markerCoordinates.latitude} ; {markerCoordinates.longitude}</h2>
          <h2>Coordonnées du Curseur : {userCursorCoordinates.latitude} ; {userCursorCoordinates.longitude}</h2>
          <h2>Status Bateau : {boatStatus}</h2>
        </div>
      </div>

      <div className="geoloca-map-container" id='geoloca-container'>
        <div className="geoloca-map" id="map"></div>
      </div>

      <div className="geoloca-subcontainer">

        <div className="geoloca-simulation">
          <h3>Simulation :</h3>
          <div>
            <label>Latitude:</label>
            <input
              type="number"
              placeholder="Latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
          <div>
            <label>Longitude:</label>
            <input
              type="number"
              placeholder="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
          <button onClick={simulateCoord}>Simuler</button>
        </div>

        <div className="geoloca-update-zone">
          <h3>Mettre à jour la zone :</h3>
          <div>
            <label>Latitude de la zone:</label>
            <input
              type="number"
              placeholder="Latitude de la zone"
              value={zoneLat}
              onChange={(e) => setZoneLat(e.target.value)}
            />
          </div>
          <div>
            <label>Longitude de la zone:</label>
            <input
              type="number"
              placeholder="Longitude de la zone"
              value={zoneLng}
              onChange={(e) => setZoneLng(e.target.value)}
            />
          </div>
          <button onClick={updateZone}>Modifier la zone</button>
        </div>
      </div>
    </div>
  );
};

export default Geolocation;
