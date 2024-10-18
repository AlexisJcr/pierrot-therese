import React from 'react';
import { Link } from 'react-router-dom';

function NousRejoindre(){
    return(
        <div className="nousrejoindre-main">
            <Link to="/"><h2>Retour à l'accueil</h2></Link>
            <iframe id="haWidget" allowtransparency="true" scrolling="auto" src="https://www.helloasso.com/associations/le-pierrot-therese/adhesions/adhesion-cotisation-le-pierrot-therese/widget"></iframe>
        </div>
    );
}

export default NousRejoindre;