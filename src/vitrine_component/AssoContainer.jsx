import React from 'react';
import logoAsso from "../assets/pictures/logo_1.png";

function AssoContainer(){
    return (
        <div className="container-asso" id="association">
            <div className="container-header">
                <div className="container-title">
                    <div className="title">
                        <h1>L'Association</h1>
                    </div>
                    <div className="red-title-decorator">
                    </div>
                </div>
            </div>

            <div className="container-box">
                <div className="container-text">
                    <p>
                    En juin 2023 à Loperhet, une poignée de passionnés de voile 
                    traditionnelle s’est rassemblée pour fonder l’association « Le 
                    Pierrot-Thérèse » du nom d’un ancien coquillier de Rostiviec, construit en 1935 par Auguste Tertu. Cette équipe rassemblée avec comme projet  de préserver le patrimoine martime, a acquis un fileyeur des années 60, l’Arvor, 
                    qui a déjà fait l’objet d’une restauration, et qui servira de vitrine aux projets futurs.

                    <br></br><br></br>À court terme, l’ambition de l’association est de restaurer ou de fabriquer des annexes, ces petits navires dont le rôle était primordial à l'époque où la voile n’était pas encore liée à la plaisance.
                    <br></br><br></br>À travers ces projets l’association « Le Pierrot-Thérèse » ambitionne de faire connaître au plus grand nombre la pratique de la voile traditionnelle ainsi que les techniques oubliées comme la pratique de la godille pour tous les âges.
                    <br></br><br></br>En parallèle, l’association souhaite établir un fond documentaire sur le patrimoine maritime de Loperhet et le rendre accessible à tous en présentant des expositions physiques ou en faisant de la diffusion sur les réseaux sociaux.
                    </p>
                </div>
                <div className="container-photo">
                    <img src={logoAsso} alt=""></img>
                </div>
            </div>
        </div>

    );
}

export default AssoContainer;