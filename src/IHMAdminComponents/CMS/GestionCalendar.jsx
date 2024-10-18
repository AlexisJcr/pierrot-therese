import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function GestionCalendar() {
  const [titre, setTitre] = useState('');
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [description, setDescription] = useState('');

  const [event, setEvent] = useState([]);
  
  const adresse = process.env.REACT_APP_API_URL;

  useEffect(() => {
    LoadEvents();
  }, []);

  const LoadEvents = async () => {
    try {
      const response = await axios.get(`${adresse}/gestioncalendrier`);
      const formattedEvents = response.data.map(event => ({
        ...event,
        date: new Date(event.date).toLocaleDateString('fr-FR', { 
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        heure: event.horaire
      }));
      setEvent(formattedEvents);
    } catch (error) {
      console.error('Erreur lors du chargement des événements : ', error);
    }
  };

  const AddEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${adresse}/gestioncalendrier`, {
        actionType: 'add',
        eventDetails: { titre, date, heure, description }
      });

      console.log('Événement ajouté avec succès');

      setTitre('');
      setDate('');
      setHeure('');
      setDescription('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'événement : ', error);
      alert('Une erreur est survenue lors de l\'ajout de l\'événement');
    }
  };

  const EditEvent = async (idEvent, updatedDetails) => {
    try {
      await axios.post(`${adresse}/gestioncalendrier`, {
        actionType: 'edit',
        eventDetails: { id: idEvent, ...updatedDetails }
      });
      console.log('Événement modifié avec succès');
      LoadEvents();
    } catch (error) {
      console.error('Erreur lors de la modification de l\'événement : ', error);
      alert('Une erreur est survenue lors de la modification de l\'événement');
    }
  };

  const DeleteEvent = async (idEvent) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?");
    if (confirmDelete) {
      try {
        await axios.post(`${adresse}/gestioncalendrier`, {
          actionType: 'delete',
          eventDetails: { id: idEvent }
        });
        console.log('Événement supprimé avec succès');
        LoadEvents();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement : ', error);
        alert('Une erreur est survenue lors de la suppression de l\'événement');
      }
    }
  };

  return (

    <div className="gc-supercontainer">
      <div className="common-header">
        <div className="common-logo">
          <img alt="" />
          <h1>Gestion Calendrier Vitrine</h1>
        </div>

        <div className="common-navbar">
          <ul>
            <li><Link to="/administrateur" style={{ textDecoration: 'none' }}><h2>Retour au Tableau de Bord</h2></Link></li>
          </ul>
        </div>
      </div>

      <div className="gc-eventmanager">
        <div className="gc-form-container">
          <h2>Ajouter un nouvel évènement</h2>
          <form onSubmit={AddEvent}>
            <label>Titre:</label>
            <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} required />
            <label>Date:</label>
            <input type="date"  value={date} onChange={(e) => setDate(e.target.value)} required />
            <label>Heure:</label>
            <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} required />
            <label>Description:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            <button type="submit">Ajouter l'événement</button>
          </form>
        </div>

        <div className="gc-eventstab">
          <h2>Événements existants :</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {event.map((event) => (
                <tr key={event.idEvent}>
                  <td>{event.idEvent}</td>
                  <td>{event.titre}</td>
                  <td>{event.date}</td>
                  <td>{event.horaire}</td>
                  <td>{event.description}</td>
                  <td><button onClick={() => DeleteEvent(event.idEvent)}>Supprimer</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GestionCalendar;
