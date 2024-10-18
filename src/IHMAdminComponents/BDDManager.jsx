import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import CsvDownloader from 'react-csv-downloader';

import mbdd from "../assets/icons/server-storage.png";

const columnDefinitions = {
  bateau: ['idBateau', 'Nom', 'Matricule'],
  carnetdebord: ['idCarnet', 'idBateau', 'date', 'idResa', 'description'],
  resa: ['idResa', 'idUtilisateur', 'idBateau', 'date', 'dateDebut', 'dateFin'],
  utilisateurs: ['idUtilisateur', 'nom', 'prenom', 'email', 'password', 'permission'],
  localisation: ['idLoca', 'idBateau','latitude', 'longitude', 'date'],
  intrusion: ['idIntru', 'date'],
  calendriervitrine: ['idEvent', 'titre', 'description', 'date', 'horaire'],
  zones: ['idZone', 'idBateau', 'latitude', 'longitude', 'radius']
};

const adresse = process.env.REACT_APP_API_URL;

function BDDManager() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get(`${adresse}/bddmanager`);
        setTables(response.data.tables);
      } catch (error) {
        console.error('Erreur lors de la récupération des tables : ', error);
      }
    };

    fetchTables();
  }, []);


  const fetchTableData = async (tableName) => {
    try {
      const response = await axios.get(`${adresse}/bddmanager/${tableName}`);
      if (response.data.length > 0) {
        if (columnDefinitions[tableName]) {
          setTableHeaders(columnDefinitions[tableName]);
          setTableData(response.data);
        } else {
          console.error('Erreur: Les colonnes ne sont pas définies pour la table', tableName);
        }
      } else {
        setTableHeaders([]);
        setTableData([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données de la table : ', error);
    }
  };


  const handleTableClick = (tableName) => {
    setSelectedTable(tableName);
    fetchTableData(tableName);
  };


  return (
    <div className="mbdd-supercontainer">
    
      <div className="common-header">
        <div className="common-logo">
          <img src={mbdd} alt="" />
          <h1>Gestion Base de Données</h1>
        </div>

        <div className="common-navbar">
          <ul>
          <li><Link to="/administrateur" style={{ textDecoration: 'none' }}><h2>Retour au Tableau de Bord</h2></Link></li>
          {selectedTable && 
              <CsvDownloader 
                filename={`${selectedTable}.csv`} 
                separator=";"
                columns={tableHeaders}
                datas={tableData}
              >
                <button className="mbdd-export-button">Exporter la table</button>
              </CsvDownloader>
            }
          </ul>
        </div>
      </div>

      <div className="mbdd-grid-container">
        <div className="mbdd-grid">
          {tables.map((table, index) => (
            <div key={index} className="mbdd-tables" onClick={() => handleTableClick(table)}><h2>{table}</h2></div>
          ))}
        </div>
      </div>

      {selectedTable && (
        <div className="mbdd-list-data">
          <h2>Données de la table {selectedTable}</h2>
          <table>
            <thead>
              <tr>
                {tableData.length > 0 && Object.keys(tableData[0]).map((columnName, index) => (
                  (columnName !== "email" && columnName !== "password") && (
                    <th key={index}>{columnName}</th>
                  )
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.keys(row).map((columnName, colIndex) => (
                    (columnName !== "email" && columnName !== "password") && (
                      <td key={colIndex}>{row[columnName]}</td>
                    )
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
    </div>
  );
};

export default BDDManager;
