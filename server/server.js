//==== Initialisation du serveur ====//
const PORT = process.env.PORT || 3001;

const express = require('express');
const http = require('http');
const cors = require('cors');

//=== Gestion de variables environnement ===//
const dotenv = require('dotenv');
dotenv.config();

const logger = require("./pino-logger"); //Librairie Log PINO

const app = express();
const httpserver = http.createServer(app);

const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json()); //Analyse les requêtes entrantes


//===== WebSocket IO =====//
const socketIO = require('socket.io');

const io = socketIO(httpserver, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connect', function (socket) {
    logger.info("Socket IO connecté: " + socket.id);

    socket.on("disconnect", function () {
        logger.info("Socket IO IO Déconnecté");
    });

    socket.on("error", function (error) {
        console.error("Erreur Socket IO " + socket.id + ": ", error);
    });

    //Simulation géolocalisation
    socket.on('simugeoloca', (coordinates) => {
        console.log('Simulated coordinates:', coordinates);
        localclient.publish('coords', JSON.stringify(coordinates));
    });

});

//===== LIB MYSQL =====//
const mysql = require('mysql2');

//=== Cryptage SHA256 ===//
const crypto = require('crypto');

//=== Cryptage Argon2 ===//
const argon = require('argon2');

//=== Token JWT ===//
const jwt = require('jsonwebtoken');
const JWT_SECRET = '***';

//================================//
//===== ACCES BASE DE DONNEE =====//
//================================//
const bdd = mysql.createConnection({
    host: '***',
    user: '***',
    password: '***',
    database: '***'
});

bdd.connect((error) => {
    if (error) {
        logger.error('Erreur de connexion à la base de données :', error.message);
    }
    else {
        logger.info('Connexion à la base de données réussie');
    }
});

//const promiseCon = bdd.promise();

//===== TTN MQTT ====//
const mqtt = require('mqtt');

const btscielmqttoptions = {
    port: 1883,
    clientId: '***',
    username: '***',
    password: '***',
    encoding: 'utf8'
}

const gpsmqttoptions = {
    port: 1883,
    clientId: 'module-web',
    username: '***',
    password: '***',
    keepalive: 1500,
    reconnectPeriod: 2000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
}


const localmqttoptions = {
    port: 1883,
    clientId: '***',
    username: '***',
    password: '***',
    keepalive: 1500,
    reconnectPeriod: 2000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
}


//=== TTN GEOLOCA ===//
const btscielclient = mqtt.connect('https://eu1.cloud.thethings.network', btscielmqttoptions);

const gpsclient = mqtt.connect('https://eu1.cloud.thethings.network', gpsmqttoptions);


const localclient = mqtt.connect('https://eu1.cloud.thethings.network', localmqttoptions);
const localclienttopic = "***";


//=== TTN CONNEXIONS ===///
btscielclient.on('connect', function () {
    logger.info('MQTT btsciel Geolocalisation connecté')
    btscielclient.subscribe('#')
});


gpsclient.on('connect', function () {
    logger.info('MQTT Alan Geolocalisation connecté')
    gpsclient.subscribe('#')
});


localclient.on('connect', () => {
    logger.info('TTN Local connecté')
    localclient.subscribe('#');
});

//=======================//
//===== GEOLOCATION =====//
//=======================//
//=== Récupération de la zone pour affichage
app.get('/geolocazone', (req, res) => {
    let sql = 'SELECT latitude, longitude FROM zones WHERE idZone = 1';
    bdd.query(sql, (err, result) => {
      if (err) throw err;
      res.send(result[0]);
    });
});

//=== Modification de la zone
app.post('/geolocazone', (req, res) => {
    const { latitude, longitude } = req.body;
    let sql = 'UPDATE zones SET latitude = ?, longitude = ? WHERE idZone = 1';
    let data = [latitude, longitude];
    bdd.query(sql, data, (err, result) => {
      if (err) throw err;
      res.send('Zone updated...');
    });
});

btscielclient.on('message', function (topic, message) { 
    try {
        const DataFromTTN = JSON.parse(message); 
        if (typeof DataFromTTN.uplink_message != "undefined") { 
            const location = DataFromTTN.uplink_message.decoded_payload;
            console.log(location);
            io.emit('location', location);

            let circleCenter = { latitude: 48.40938, longitude: -4.48745 };
            bdd.query('SELECT latitude, longitude FROM zones WHERE idZone = 1', (err, result) => {
                if (err) throw err;
                if (result.length) {
                    console.log(result);
                    circleCenter = {
                        latitude: result[0].latitude,
                        longitude: result[0].longitude
                    };
                }
                const circleRadius = 150;
                const distance = calculDistance(location, circleCenter);
                let status = false;
                if (distance > circleRadius) {
                    logger.warn("Le bateau est en dehors du cercle");
                    io.emit('locaBoatStatus', false);
                } else {
                    logger.info("Le bateau est dans le cercle");
                    io.emit('locaBoatStatus', true);
                    status = true;
                }
                //saveLoca(location.latitude, location.longitude, status);
            });
        }
    }
    catch (error) {
        logger.error(error);
    }
});

function saveLoca(latitude, longitude, status) {
    const requete = "INSERT INTO Localisation (idBateau,latitude, longitude, date, status) VALUES (1, ?, ?, NOW(), ?)";
    bdd.query(requete, [latitude, longitude, status], function (err, result) {
        if (err) {
            logger.error("Erreur lors de l'insertion des données dans la table Localisation: " + err);
        } else {
            logger.info("Données de localisation insérées avec succès dans la table Localisation");
        }
    });
}

app.post('/simugeoloca', (req, res) => {
    const { latitude, longitude } = req.body;
    console.log(latitude, longitude);
    sendCoordTTN(latitude,longitude);
    res.status(200).send('Coordonnées envoyés');
});

const sendCoordTTN = (latitude, longitude) => {
    console.log('sendCoordTTN', { latitude, longitude });
    const payload = JSON.stringify({ latitude, longitude });
    const encodedPayload = Buffer.from(payload).toString('base64');
    const message = JSON.stringify({
        downlinks: [
            {
                f_port: 1,
                frm_payload: encodedPayload,
                priority: 'NORMAL',
            },
        ],
    });

    try {
        localclient.publish(localclienttopic, message, localmqttoptions, (err) => {
            if (err) {
                console.error('Failed to publish message:', err);
            } else {
                console.log('Message published successfully');
            }
        });
    } catch (e) {
        console.log('Publish error:', e);
    }
};

localclient.on('message', function (topic, message) {
    try {
        const data = JSON.parse(message.toString());
        const encodedData = data.downlink_failed.downlink.frm_payload;
        const location = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'));

        const latitude = parseFloat(location.latitude);
        const longitude = parseFloat(location.longitude);

        const coordinates = { latitude, longitude };

        io.emit('location', coordinates);
        if (coordinates) {
            let circleCenter = { latitude: 48.40938, longitude: -4.48745 };
            bdd.query('SELECT latitude, longitude FROM zones WHERE idZone = 1', (err, result) => {
                if (err) throw err;
                if (result.length) {
                    console.log(result);
                    circleCenter = {
                        latitude: result[0].latitude,
                        longitude: result[0].longitude
                    };
                }
                const circleRadius = 150;
                const distance = calculDistance(location, circleCenter);

                let status = false;
                if (distance > circleRadius) {
                    logger.warn("Le bateau est en dehors du cercle");
                    io.emit('locaBoatStatus', false);
                } else {
                    logger.info("Le bateau est dans le cercle");
                    io.emit('locaBoatStatus', true);
                    status = true;
                }
                saveLoca(location.latitude, location.longitude, status);
            });
        }
    } catch (e) {
        console.log('Error processing message:', e);
    }
});

function calculDistance(loca1, loca2) {
    const R = 6371e3; //Rayon de la Terre
    const lat1 = loca1.latitude * Math.PI / 180; //Latitude du bateau en RADIANTS
    const lat2 = loca2.latitude * Math.PI / 180; //Latitude du cercle en RADIANTS
    const deltaLat = (loca2.latitude - loca1.latitude) * Math.PI / 180; //Différence de latitude en RADIANTS
    const deltaLon = (loca2.longitude - loca1.longitude) * Math.PI / 180; //Différence de longitude en RADIANTS

    //==== HAVERSINE Trigonométrie ====//
    //Première partie Haversine
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    //Deuxième partie Haversine
    //Calcule de l'angle central de la Terre entre les deux points
    const b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    //DISTANCE FINALE
    const distance = R * b; //Calcul pour obtenir la distance entre les deux points en mètres

    return distance;
}

//=====================//
//===== INTRUSION =====//
//=====================//
app.post('/intrusion', (req, res) => {
    const intrusionValue = req.body.intrusion;
    console.log("Valeur envoyée sur le TTN : ", intrusionValue);
    const encodedIntruVal = btoa(intrusionValue);
    const message = '{"downlinks":[{"f_port": 1,"frm_payload":"' + encodedIntruVal + '","priority": "NORMAL"}]}'
    localclient.publish(localclienttopic, message, localmqttoptions);
    res.sendStatus(200);
});

localclient.on('message', function (topic, message) {
    try {
        const data = JSON.parse(message);
        const encodedIntruValue = data.downlink_failed.downlink.frm_payload;
        const intrusionValue = Buffer.from(encodedIntruValue, 'base64').toString('utf-8');

        console.log("Valeur reçue du TTN : ", intrusionValue);
        io.emit('simuintrusion', intrusionValue);
    }
    catch (e) {
        console.log(e);
    }
});

//====================================//
//===== FONCTION CRYPTAGE SHA256 =====//
//====================================//
function cryptEmail(email) {
    const hash = crypto.createHash('sha256');
    hash.update(email);
    return hash.digest('hex');
}

//==========================//
//==== AUTHENTIFICATION ====//
//==========================//
function getEmail(cryptedEmail, callback) {
    const requete = 'SELECT utilisateurs.email FROM utilisateurs WHERE utilisateurs.email = ?';
    bdd.query(requete, [cryptedEmail], (error, result) => {
        if (error) {
            logger.error('MySQL getEmail', error.message);
            callback(error, null);
        } else {
            if (result.length > 0) { 
                const email = result[0].email;
                callback(null, email);
            } else {
                logger.info(cryptedEmail)
                logger.error('Email non trouvée');
                callback(null, null);
            }
        }
    });
}

function getPassword(cryptedEmail, callback) {
    const requete = 'SELECT utilisateurs.password FROM utilisateurs WHERE utilisateurs.email = ?';
    bdd.query(requete, [cryptedEmail], (error, result) => {
        if (error) {
            logger.error('MySQL getPassword', error.message);
            callback(error, null);
        } else {
            if (result.length > 0) {
                const password = result[0].password;
                callback(null, password);
            } else {
                logger.log('Erreur mot de passe');
                callback(null, null);
            }
        }
    });
}

function getPermission(cryptedEmail, callback) {
    bdd.query('SELECT utilisateurs.permission FROM utilisateurs WHERE utilisateurs.email = ?', [cryptedEmail], (error, result) => {
        if (error) {
            logger.error('MySQL getPermission', error.message);
            callback(error, null);
        } else {
            if (result.length > 0) {
                const permission = result[0].permission;
                callback(null, permission);
            } else {
                logger.error('Erreur permission');
                callback(null, null);
            }
        }
    });
}

function getName(cryptedEmail, callback) {
    bdd.query('SELECT utilisateurs.idUtilisateur, utilisateurs.nom, utilisateurs.prenom FROM utilisateurs WHERE utilisateurs.email = ?', [cryptedEmail], (error, result) => {
        if (error) {
            logger.error('Erreur lors de la récupération du nom et prénom :', error.message);
            callback(error, null, null);
        } else {
            if (result.length > 0) {
                const nom = result[0].nom;
                const prenom = result[0].prenom;
                const idUtilisateur = result[0].idUtilisateur;
                callback(null, idUtilisateur, nom, prenom);
            } else {
                logger.error('Erreur getName');
                callback(null, null, null);
            }
        }
    });
}

app.post('/login', (req, response) => {
    const { formemail, password } = req.body; 
    if (!formemail || !password) { 
        logger.warn('Veuillez entrer les informations de connexion !');
        return response.status(400).json({ message: 'Veuillez entrer les informations de connexion' });
    }
    else {
        try {
            const cryptedEmail = cryptEmail(formemail); 
            getEmail(cryptedEmail, (error, bddemail) => { 
                if (error) {
                    logger.error(error);
                    return response.status(500).json({ message: 'Erreur interne du serveur' });
                } else {
                    if (bddemail === null) { 
                        logger.error("L'adresse email n'existe pas")
                        return response.status(401).json({ message: "Identifiants incorrects" });
                    }
                    else {
                        getPassword(cryptedEmail, (error, bddpassword) => { 
                            if (error) {
                                logger.error(error);
                                return response.status(500).json({ message: 'Erreur interne du serveur' });
                            } else {
                                argon.verify(bddpassword, password).then(match => { 
                                    if (match) { 
                                        getPermission(cryptedEmail, (error, permission) => { 
                                            if (error) {
                                                logger.error(error);
                                                return response.status(500).json({ message: 'Erreur lors de l\'authentification' });
                                            }
                                            const role = permission === 'administrateur' ? 'administrateur' : 'adherent';
                                            getName(cryptedEmail, (error, IDuser, nom, prenom) => {
                                                if (error) {
                                                    logger.error(error);
                                                    return res.status(500).json({ message: 'Erreur lors de l\'authentification' });
                                                }
                                                console.log(IDuser);
                                                const tokenPayload = { //Assemblage des informations pour le token JWT
                                                    idUtilisateur: IDuser,
                                                    email: bddemail,
                                                    role: role,
                                                    nom: nom,
                                                    prenom: prenom
                                                };
                                                const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30min' }); //Constitution du token JWT
                                                logger.info('Authentification réussie !');
                                                logger.info('Token attribué');
                                                response.json({ token });
                                            });
                                        });
                                    } else {
                                        console.log('Mot de passe incorrect !');
                                        response.status(401).json({ message: 'Identifiants incorrects' });
                                    }
                                })
                                    .catch(error => {
                                        console.error('Erreur lors de la vérification du mot de passe :', error);
                                    });
                            }
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'authentification :', error);
        }
    }
});

//===========================//
//===== ACCOUNT MANAGER =====//
//===========================//

app.get('/accountmanager', (req, res) => {
    const requete = 'SELECT utilisateurs.idUtilisateur, utilisateurs.nom, utilisateurs.prenom, utilisateurs.permission FROM utilisateurs;'
    bdd.query(requete, (error, rows) => {
        if (error) {
            logger.error("Erreur d'accès aux comptes utilisateurs", error);
            res.status(500).send();
        } else {
            res.json(rows); 
        }
    });
});


app.post('/accountmanager', async (req, res) => {
    const { actionType, userId, nom, prenom, email, password, permission } = req.body; 
    try {
        if (actionType === 'edit') { 
            if (!userId) {
                throw new Error('ID utilisateur manquant pour la modification');
            }
            await modifyUser(userId, nom, prenom, email, password, permission); 
            res.status(200).send({ message: 'Utilisateur modifié avec succès' });
        }
        else if (actionType === 'delete') { 
            if (!userId) {
                throw new Error('ID utilisateur manquant pour la suppression');
            }
            await deleteUser(userId); 
            res.status(200).send({ message: 'Utilisateur supprimé avec succès' });
        }
        else { 
            await addUser(nom, prenom, email, password, permission); 
            res.status(200).send({ message: 'Utilisateur ajouté avec succès' });
        }
    } catch (error) {
        console.error('Erreur lors de l\'opération sur l\'utilisateur :', error.message);
        res.status(500).send({ error: 'Erreur lors de la modification de l\'utilisateur' });
    }
});

async function addUser(nom, prenom, email, password, permission) {
    if (!nom || !prenom || !email || !password || !permission) { 
        throw new Error('Informations manquantes');
    }
    try {
        const cryptedPassword = await argon.hash(password); //Cryptage mot de passe en Argon2
        const cryptedEmail = cryptEmail(email) 
        const requete = 'INSERT INTO utilisateurs (nom, prenom, email, password, permission) VALUES (?, ?, ?, ?, ?)' 
        bdd.query(requete, [nom, prenom, cryptedEmail, cryptedPassword, permission]); 
        console.log('Utilisateur ajouté avec succès'); //Logs
    } catch (error) {
        console.error('Erreur lors de l\'insertion de l\'utilisateur :', error);
        throw new Error('Erreur lors de l\'insertion de l\'utilisateur');
    }
}

async function modifyUser(userId, nom, prenom, email, password, permission) {
    if (!userId) {
        throw new Error('ID utilisateur manquant');
    }
    try {
        let updateFields = []; 
        let updateValues = []; 
        if (nom) {
            updateFields.push('nom = ?');
            updateValues.push(nom);
        }
        if (prenom) { 
            updateFields.push('prenom = ?');
            updateValues.push(prenom);
        }
        if (email) { 
            const cryptedEmail = cryptEmail(email)
            updateFields.push('email = ?');
            updateValues.push(cryptedEmail);
        }
        if (password) {
            const cryptedPassword = await argon.hash(password);
            updateFields.push('password = ?');
            updateValues.push(cryptedPassword);
        }
        if (permission) { 
            updateFields.push('permission = ?');
            updateValues.push(permission);
        }
        if (updateFields.length === 0) { 
            throw new Error('Aucun champ à mettre à jour n\'a été fourni');
        }

        updateValues.push(userId); 
        const requete = 'UPDATE utilisateurs SET ' + updateFields.join(', ') + ' WHERE utilisateurs.idUtilisateur = ?';
        
        bdd.query(requete, updateValues);
        logger.info('Utilisateur modifié avec succès'); //Logs
        
    } catch (error) {
        logger.error('Erreur lors de la modification de l\'utilisateur :', error);
        throw new Error('Erreur lors de la modification de l\'utilisateur');
    }
}

async function deleteUser(userId) {
    if (!userId) { 
        throw new Error('ID utilisateur manquant');
    }
    const requete = 'DELETE FROM utilisateurs WHERE idUtilisateur = ?'; 
    try {
        bdd.query(requete, [userId]); 

        logger.info('Utilisateur supprimé avec succès'); //Logs
    } catch (error) {
        logger.error('Erreur lors de la suppression de l\'utilisateur :', error);
        throw new Error('Erreur lors de la suppression de l\'utilisateur');
    }
}

//================================//
//===== RESERVATION ADHERENT =====//
//================================//
app.post('/adherentresa', (req, res) => {
    const { start, end, userID } = req.body;

    const query = 'INSERT INTO resa (date, dateDebut, dateFin, idUtilisateur, idBateau) VALUES (?, ?, ?, ?, 1)';

    bdd.query(query, [new Date(), start, end, userID], (error, result) => {
        if (error) {
            console.log('Erreur lors de l\'ajout de la réservation :', error);
            res.status(500).send('Erreur lors de l\'ajout de la réservation');
            return;
        }
        logger.info('Réservation ajoutée avec succès');
        res.status(200).send('Réservation ajoutée avec succès');
    });
});

app.get('/adherentresa', (req, res) => {
    const query = `
    SELECT resa.*, utilisateurs.nom, utilisateurs.prenom
    FROM resa
    INNER JOIN utilisateurs ON resa.idUtilisateur = utilisateurs.idUtilisateur`;

    bdd.query(query, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des réservations :', error);
            res.status(500).send('Erreur lors de la récupération des réservations');
            return;
        }
        res.status(200).json(results);
    });
});

app.get('/adherentresa/reservations/:userID', (req, res) => {
    const userID = req.params.userID;
    bdd.query('SELECT * FROM resa WHERE idUtilisateur = ?', [userID], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des réservations de l\'utilisateur :', error);
            res.status(500).send('Erreur lors de la récupération des réservations de l\'utilisateur');
        } else {
            res.json(results);
        }
    });
});

app.delete('/adherentresa/reservations/:id', (req, res) => {
    const idResa = req.params.id;
    const deleteCarnet = 'DELETE FROM carnetdebord WHERE carnetdebord.idResa = ?';
    const deleteResa = 'DELETE FROM resa WHERE resa.idResa = ?';

    bdd.query(deleteCarnet, [idResa], (deleteErr, deleteResult) => {
        if (deleteErr) {
            console.error('Erreur lors de la suppression du carnet de bord :', deleteErr);
            res.status(500).json({ message: 'Erreur lors de la suppression du carnet de bord' });
        } else {
            //Suppression de la réservation
            bdd.query(deleteResa, [idResa], (error, result) => {
                if (error) {
                    console.error('Erreur lors de la suppression de la réservation :', error);
                    res.status(500).json({ message: 'Erreur lors de la suppression de la réservation' });
                } else {
                    console.log('Réservation supprimée avec succès');
                    res.status(200).json({ message: 'Réservation supprimée avec succès' });
                }
            });
        }
    });
});

//==========================//
//===== CARNET DE BORD =====//
//==========================//
app.get('/carnetdebord/:idBateau', async (req, res) => {
    const query = 'SELECT * FROM carnetdebord WHERE carnetdebord.idBateau = 1';

    bdd.query(query, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des carnets :', error);
            res.status(500).send('Erreur lors de la récupération des carnets');
            return;
        }
        res.status(200).json(results);
    });
});


app.get('/resacarnetdebord/check/:reservationID', (req, res) => {
    const idResa = req.params.reservationID;
    const requete = `SELECT idCarnet FROM carnetdebord WHERE carnetdebord.idResa = ?`;

    bdd.query(requete, [idResa], (error, results) => {
        if (error) {
            console.error('Erreur lors de la vérification du carnet de bord :', error);
            res.status(500).send('Erreur lors de la vérification du carnet de bord');
        } else {
            if (results.length > 0) {
                console.log("Le carnet existe déjà");
                res.json({ carnetExists: true }); //renvoi la valeur true au front react si le carnet existe
            } else {
                console.log("Le carnet n'existe pas");
                res.json({ carnetExists: false }); //renvoi la valeur false au front react si le carnet n'existe pas
            }
        }
    });
});

app.post('/carnetdebord', (req, res) => {
    const { idResa, idBateau, description } = req.body; 
    //=== Vérifie la présence des informations nécessaires
    if (!idResa || !description) {
        return res.status(400).json({ message: "idResa et description sont nécessaires pour créer une entrée dans le carnet de bord." });
    }
    //=== Envoi une requete pour regarder si un carnet existe déjà ===//
    const checkIfExistQuery = 'SELECT * FROM carnetdebord WHERE idResa = ?';
    bdd.query(checkIfExistQuery, [idResa], (checkerror, checkresult) => {
        if (checkerror) {
            console.error('Erreur lors de la vérification de l\'existence du carnet de bord :', checkerror);
            return res.status(500).json({ message: "Une erreur s'est produite lors de la vérification de l'existence du carnet de bord." });
        }
        //=== Vérifie si il n'y a aucun carnet existant ===//
        if (checkresult.length > 0) {
            console.log('Un carnet de bord existe déjà pour cette réservation.');
            return res.status(400).json({ message: "Un carnet de bord existe déjà pour cette réservation." });
        } else {
            //=== Sauvegarde du carnet de bord ===//
            const insertQuery = 'INSERT INTO carnetdebord (carnetdebord.idResa, carnetdebord.idBateau, carnetdebord.date, carnetdebord.description) VALUES (?, ?, NOW(), ?)';
            bdd.query(insertQuery, [idResa, idBateau, description], (adderror, addresult) => {
                if (adderror) {
                    console.error('Erreur lors de l\'ajout de l\'entrée dans le carnet de bord :', insertErr);
                    return res.status(500).json({ message: "Une erreur s'est produite lors de l'ajout de l'entrée dans le carnet de bord." });
                }
                console.log('Nouvelle entrée ajoutée dans le carnet de bord.');
                res.status(201).json({ message: "Nouvelle entrée ajoutée dans le carnet de bord." });
            });
        }
    });
});

//=======================//
//===== BDD MANAGER =====//
//=======================//
app.get('/bddmanager', (req, res) => {
    bdd.query('SHOW TABLES', (error, results, fields) => {
        if (error) {
            logger.error('Erreur lors de l\'exécution de la requête : ' + error.message);
            res.status(500);
            return;
        }
        const tables = results.map(row => row[fields[0].name]);
        res.json({ tables });
    });
});

app.get('/bddmanager/:tablename', (req, res) => {
    const tableName = req.params.tablename;
    bdd.query(`SELECT * FROM ${tableName}`, (error, results, fields) => {
        if (error) {
            console.error(`Erreur lors de la récupération des données de la table ${tableName} : `, error);
            res.status(500).json({ error: `Erreur lors de la récupération des données de la table ${tableName}` });
            return;
        }
        res.json(results);
    });
});

app.get('/export/:tablename', (req, res) => {
    const tableName = req.params.tablename;
  
    bdd.query(`SELECT * FROM ${tableName}`, (error, results) => {
      if (error) {
        console.error(`Erreur lors de la récupération des données de la table ${tableName} : `, error);
        res.status(500).json({ error: `Erreur lors de la récupération des données de la table ${tableName}` });
        return;
      }
  
      res.json(results);
    });
  });

//===============//
//===== CMS =====//
//===============//

//===== CALENDRIER VITRINE =====//

app.get('/gestioncalendrier', (req, res) => {
    const queryString = 'SELECT * FROM calendriervitrine';

    bdd.query(queryString, (error, results) => {
        if (error) {
            console.log('Erreur lors du chargement des événements : ', error);
            res.status(500).json({ error: 'Erreur lors du chargement des événements' });
        } else {
            res.json(results);
        }
    });
});

app.post('/gestioncalendrier', (req, res) => {
    const { actionType, eventDetails } = req.body;
    logger.info(eventDetails);

    switch (actionType) {
        case 'add':
            logger.info("Add détecté")
            addCalendarEvent(eventDetails, res);
            break;
        case 'edit':
            editCalendarEvent(eventDetails, res);
            break;
        case 'delete':
            const { id } = eventDetails;
            deleteCalendarEvent(id, res);
            break;
        default:
            logger.error("Event non détecté");
            res.status(400).json({ error: 'Type d\'action non valide' });
    }
});

function addCalendarEvent(eventDetails, res) {
    const { titre, date, heure, description } = eventDetails;
    const queryString = 'INSERT INTO calendriervitrine (titre, date, horaire, description) VALUES (?, ?, ?, ?)';

    bdd.query(queryString, [titre, date, heure, description], (error, results) => {
        if (error) {
            logger.error('Erreur lors de l\'ajout de l\'événement : ', error);
            res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'événement' });
        } else {
            res.json({ message: "Événement ajouté avec succès" });
        }
    });
}

function deleteCalendarEvent(eventId, res) {
    if (!eventId) {
        throw new Error('ID de l\'événement manquant');
    }
    console.log("IDevent :", eventId);
    bdd.query('DELETE FROM calendriervitrine WHERE idEvent = ?', [eventId], (error, results) => {
        if (error) {
            logger.error('Erreur lors de la suppression de l\'événement : ', error);
            res.status(500).json({ error: 'Erreur lors de la suppression de l\'événement' });
        } else {
            logger.info("Événement supprimé avec succès");
            res.json({ message: "Événement supprimé avec succès" });
        }
    });
}

//================//
//===== APP  =====//
//================//
httpserver.listen(PORT, () => {
    logger.info(`Le serveur écoute sur le port ${PORT}`);
});


