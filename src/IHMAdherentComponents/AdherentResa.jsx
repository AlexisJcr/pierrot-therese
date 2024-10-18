import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

//Librarie FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import resalogo from "../assets/icons/calendar.png";

const adresse = process.env.REACT_APP_API_URL;

const AdherentResa = () => {
    const calendarRef = useRef(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [allReservations, setAllReservations] = useState([]);
    const [userReservations, setUserReservations] = useState([]);

    const navigate = useNavigate();

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


    //Récupération de l'ensemble des réservations de la BDD
    useEffect(() => {
        axios.get(`${adresse}/adherentresa`)
            .then(response => {
                const formatReservations = response.data.map(reservation => ({
                    ...reservation,
                    start: new Date(reservation.dateDebut).toISOString(), //FullCalendar utilise un formatage de date type ISO String
                    end: new Date(reservation.dateFin).toISOString()
                }));
                setAllReservations(formatReservations); //Stockage des réservations dans une variable local au client
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des réservations :', error);
            });
    }, []);

    //Récupération des réservations effectuées par l'utilisateur connecté
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const userID = getUserID(); //Récupération de l'id de l'utilisateur connecté depuis le token JWT
            axios.get(`${adresse}/adherentresa/reservations/${userID}`)
                .then(response => {                                               
                    const formatUserReservations = response.data.map(reservation => ({
                        ...reservation,
                        start: new Date(reservation.dateDebut).toISOString(), 
                        end: new Date(reservation.dateFin).toISOString()
                    }));
                    setUserReservations(formatUserReservations); 
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération des réservations de l'utilisateur:", error);
                });
        }
    }, []);

    const formatCreaResa = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateResa = (dateTimeString, type) => {
        const date = new Date(dateTimeString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const isSlotSelectable = (slot) => {
        return allReservations.every(reservation => {//Vérifie la condition pour tout les créneaux réservés
            //Vérifie si un créneau ne superpose pas un autre
            return (new Date(slot.start) >= new Date(reservation.end)) || (new Date(slot.end) <= new Date(reservation.start));
        });
    };

    const funcDateSelect = (arg) => {
        const start = new Date(arg.startStr);
        const end = new Date(arg.endStr);
        const duration = (end - start) / (1000 * 60 * 60); //Calcul durée total du créneau

        if (duration <= 12 && isSlotSelectable(arg)) { //Si la durée total est inférieure à 12h et si le créneau ne superpose pas un autre
            setSelectedSlot({ //Ajoute le créneau dans la liste des réservations locale
                start: arg.startStr,
                end: arg.endStr
            });
        } else if (duration > 12) {
            alert('Vous ne pouvez pas réserver plus de 12 heures.');
        } else {
            alert('Ce créneau est déjà réservé.');
        }
    };

    const funcReservation = () => {
        if (selectedSlot) {
            const confirmresa = window.confirm("Veuillez confirmer la réservation"); //Pop-up permettant une ultime confirmation de réservation
            if (confirmresa) {
                const reservationData = {
                    start: selectedSlot.start,
                    end: selectedSlot.end,
                    userID: getUserID()
                };
                axios.post(`${adresse}/adherentresa`, reservationData) //Requête post vers le serveur
                    .then(response => {
                        console.log('Réservation ajoutée avec succès:', response.data);
                        setSelectedSlot(null);
                    })
                    .catch(error => {
                        console.error('Erreur lors de l\'ajout de la réservation:', error);
                        setSelectedSlot(null);
                    });
            }
        }
    };

    const handleDelete = (reservation) => {
        const confirmDelete = window.confirm("Voulez-vous vraiment supprimer cette réservation ?");
        if (confirmDelete) {
            axios.delete(`${adresse}/adherentresa/reservations/${reservation.idResa}`)
                .then(response => {
                    console.log('Réservation supprimée avec succès:', response.data);
                    setUserReservations(prevReservations => prevReservations.filter(prevReservation => prevReservation !== reservation));
                    setAllReservations(prevReservations => prevReservations.filter(prevReservation => prevReservation !== reservation));
                })
                .catch(error => {
                    console.error('Erreur lors de la suppression de la réservation :', error);
                });
        }
    };

    const handleFillCarnet = (idResa, idBateau) => {
        console.log(idResa, idBateau);
        axios.get(`${adresse}/resacarnetdebord/check/${idResa}`)
            .then(response => {
                if (response.data.carnetExists) {
                    console.log("Le carnet existe déjà");
                } else {
                    navigate(`/carnetdebord?idResa=${idResa}&idBateau=${idBateau}`);
                }
            })
            .catch(error => {
                console.error("Erreur lors de la vérification du carnet de bord :", error);
            });
    };
    
    return (
        <div className="resa-supercontainer">
            <div className="common-header">
                <div className="common-logo">
                    <img src={resalogo} alt="" />
                    <h1>Réserver</h1>
                </div>

                <div className="common-navbar">
                    <ul>
                        <li><Link to={getLink()} style={{ textDecoration: 'none' }}>
                <h2>Retour au Tableau de Bord</h2>
            </Link></li>
                    </ul>
                </div>
            </div>
            <div className="resa-container">
                <div className="resa-calendar">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        selectable={true}
                        select={funcDateSelect}
                        ref={calendarRef}
                        eventColor='#D2331B'
                        height="700px"
                        events={allReservations.map(reservation => ({
                            title: `Réservé par ${reservation.prenom} ${reservation.nom}`,
                            start: reservation.start,
                            end: reservation.end,
                            color: userReservations.some(userReservation => (
                                new Date(userReservation.start) <= new Date(reservation.end) &&
                                new Date(userReservation.end) >= new Date(reservation.start)
                            )) ? '#1032ad' : '#D2331B'
                        }))}
                    />

                </div>
                <div className='resa-panel'>
                    {selectedSlot && (
                        <div className="resa-items-container">
                            <div className="adherentresa-items">
                                <p>Plage horaire sélectionnée:<br></br><strong>Début</strong>:{selectedSlot.start}<br></br><strong>Fin</strong>:{selectedSlot.end}</p>
                                <button onClick={funcReservation}><h2>Réserver</h2></button>
                            </div>
                        </div>
                    )}
                    <div className="resa-userresa">
                        <h2>Vos réservations :</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Date de Réservation</th>
                                    <th>Heure de début</th>
                                    <th>Heure de fin</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userReservations.map((reservation, index) => (
                                    <tr key={index}>
                                        <td>{reservation.idResa}</td>
                                        <td>{formatCreaResa(reservation.date)}</td>
                                        <td>{formatDateResa(reservation.dateDebut)}</td>
                                        <td>{formatDateResa(reservation.dateFin)}</td>
                                        <td><button onClick={() => handleFillCarnet(reservation.idResa, reservation.idBateau)}>Carnet</button></td>
                                        <td><button onClick={() => handleDelete(reservation)}>Supprimer</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdherentResa;
