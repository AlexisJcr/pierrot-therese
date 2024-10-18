import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';

import axios from 'axios';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


import '../calendar.css';

function EventsContainer() {
    const [events, setEvents] = useState([]);
    const adresse = process.env.REACT_APP_API_URL;
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${adresse}/gestioncalendrier`);
            const formattedEvents = response.data.map(event => ({
                title: `${event.titre} ${event.horaire}`,
                date: event.date,
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error('Erreur lors du chargement des événements : ', error);
        }
    };

    const eventContent = (arg) => {
        return (
          <div className="fc-event-content">
            <div className="fc-content">{arg.event.horaire}</div>
            <div className="fc-title">{arg.event.title}</div>
          </div>
        );
      };

    return (
        <div className="eventscontainer" id="evenements">
            <div className="container-header">
                <div className="container-title">
                    <div className="title">
                        <h1>Évènements</h1>
                    </div>
                    <div className="red-title-decorator">
                    </div>
                </div>
            </div>

            <div className="super-container-calendar">
                <div className="calendar-container">
                    <FullCalendar
                        locale="fr"
                        plugins={[dayGridPlugin, multiMonthPlugin]}
                        initialView="dayGridMonth"
                        height={900}
                        headerToolbar={{
                            start: 'title',
                            center: 'dayGridWeek dayGridMonth multiMonthYear',
                            end: 'today prev,next'
                        }}
                        events={events.map(event => ({
                            title: event.title,
                            start: event.date,
                        }))}
                        eventContent={eventContent}
                    />
                </div>
            </div>
        </div>
    );
}

export default EventsContainer;
