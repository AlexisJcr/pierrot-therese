import React from 'react';

// ===== Composants Vitrine =====//
import Header from './Header';
import MainContainer from './MainContainer';
import AssoContainer from './AssoContainer';
import MissionContainer from './MissionContainer';
import EventsContainer from './EventsContainer';
import GalerieContainer from './GalerieContainer';

function Vitrine() { //Render PageVitrine
    return (
      <div>
        <Header />
        <MainContainer />
        <AssoContainer />
        <MissionContainer />
        <EventsContainer />
        <GalerieContainer />
      </div>
    );
  }

export default Vitrine;