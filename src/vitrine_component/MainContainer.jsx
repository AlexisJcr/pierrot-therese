import React from 'react';
import { Link } from 'react-router-dom';

function MainContainer(){
    return( 
        <div className="main-container" id="accueil">
            <div className="main-container-title">
                <h2>Association</h2>
                <h1>Le Pierrot Thérèse</h1>
            </div>

            <div className="main-container-button">
                <Link to="/nousrejoindre">Nous Rejoindre</Link>
            </div>
        </div>
    );
}

export default MainContainer;