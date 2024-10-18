import React from 'react';

function MissionContainer() {
    return (
        <div className="supercontainer-missions" id="missions">
            <div className="container-header">
                <div className="container-title">
                    <div className="title">
                        <h1>Nos Missions</h1>
                    </div>
                    <div className="blue-title-decorator">
                    </div>
                </div>
            </div>

            <div className="mission-boxs">
                <div className="mission-container1">
                    <div className="mission-background">
                        <div className="mission-subtitle">
                            <h2>Participer à toute action de préservation du patrimoine maritime</h2>
                        </div>

                        <div className="mission-box">
                            <div className="mission-text">
                                <ul>
                                    <li>
                                        Etablir un fond documentaire sur la rade de Brest/ Loperhet
                                    </li>
                                    <li>
                                        Permettre un lien entre les générations, pour perdurer les savoirs d'autrefois
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mission-container2">
                    <div className="mission-background">
                        <div className="mission-subtitle">
                            <h2>Promouvoir la sauvegarde du patrimoine maritime
                            </h2>
                        </div>

                        <div className="mission-box">
                            <div className="mission-text">
                                <ul>
                                    <li>
                                        Apprentissage de la Godille
                                    </li>
                                    <li>
                                        Entretien et mise en oeuvre bateau traditionnel
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mission-container3">
                    <div className="mission-background">
                        <div className="mission-subtitle">
                            <h2>Participer et organiser des évènements maritime
                            </h2>
                        </div>

                        <div className="mission-box">
                            <div className="mission-text">
                                <ul>
                                    <li>
                                        Concours de Godille
                                    </li>
                                    <li>
                                        Régate
                                    </li>
                                    <li>
                                        Exposition patrimoine maritime
                                    </li>
                                    <li>
                                        Balade en mer
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default MissionContainer;