import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';

import malogo from "../assets/icons/manageaccount.png";

function AccountManagement() {
  const [userAccounts, setUserAccounts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [returnMessage, setReturnMessage] = useState(null);
  // Formulaires
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    permission: ''
  });
  const adresse = process.env.REACT_APP_API_URL;


  useEffect(() => { 
    console.log(adresse);
    axios.get(`${adresse}/accountmanager`)
      .then(response => {
        setUserAccounts(response.data);
      })
      .catch(error => {
        console.error("Erreur lors de l'affichage des utilisateurs:", error);
      });
  }, []);


  //===== FONCTION ADD =====//
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  const funcInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const funcAddSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    axios.post(`${adresse}/accountmanager`, formData)
      .then(response => {
        setUserAccounts([...userAccounts, response.data]);
        toggleAddForm();
        window.location.reload();
      })
      .catch(error => {
        console.error('Error adding user:', error);
      });
  };

  //===== FONCTION EDIT =====//*
  const toggleEditForm = () => {
    setShowEditForm(!showEditForm);
  };

  const funcEditClick = (userId) => {
    console.log('Modification utilisateur ID:', userId);
    setSelectedUserId(userId);
    setShowEditForm(true);
  
    const selectedUser = userAccounts.find(user => user.idUtilisateur === userId);
    setFormData(selectedUser);
  };

  const funcEditSubmit = (e) => {
    e.preventDefault();
    const { nom, prenom, email, password, permission } = formData;
    axios.post(`${adresse}/accountmanager`, { actionType: 'edit', userId: selectedUserId, nom, prenom, email, password, permission })
      .then(response => {
        const updatedUsers = userAccounts.map(user => {
          if (user.idUtilisateur === selectedUserId) {
            return response.data;
          }
          return user;
        });
        setUserAccounts(updatedUsers);
        setShowEditForm(false);
        window.location.reload();
      })

      .catch(error => {
        console.error('Error modifying user:', error);
      });
  };

  //===== FONCTION DELETE =====//

  const funcDeleteSubmit = (userId) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?");
    if (confirmDelete) {
      axios.post(`${adresse}/accountmanager`, { userId, actionType: "delete" })
        .then(response => {
          setReturnMessage(response.data.message);

          const updatedUsers = userAccounts.filter(user => user.idUtilisateur !== userId);
          setUserAccounts(updatedUsers);
        })
        .catch(error => {
          console.error('Error deleting user:', error);
        });
    }
  };

  return (
    <div className="maccount-supercontainer">

      <div className="common-header">
        <div className="common-logo">
          <img src={malogo} alt="" />
          <h1>Gestion des Comptes</h1>
        </div>

        <div className="common-navbar">
          <ul>
            <li><Link to="/administrateur" style={{ textDecoration: 'none' }}><h2>Retour au Tableau de Bord</h2></Link></li>
          </ul>
        </div>
      </div>

      <div className="maccount-box">
        <div className="maccount-addbutton">
          <div className='maccount-addbutton-items' onClick={toggleAddForm}>
            <h3>Ajouter un compte</h3>
            <FontAwesomeIcon icon={faPlus} />
          </div>
        </div>

        {showAddForm && (
          <div className="maccount-form-add">
            <div className="maccount-form-add-container">
              <h2>Ajouter un compte</h2>
              <form onSubmit={funcAddSubmit}>
                <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={funcInputChange} required />
                <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={funcInputChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={funcInputChange} required />
                <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={funcInputChange} required />

                <select name="permission" value={formData.permission} onChange={funcInputChange} required>
                  <option value="">Permission</option>
                  <option value="administrateur">Administrateur</option>
                  <option value="adherent">Adhérent</option>
                </select>

                <button type="submit">Ajouter</button>
              </form>
              <button onClick={toggleAddForm}>Annuler</button>
            </div>
          </div>
        )}

        {showEditForm && (
          <div className="maccount-form-edit">
            <div className="maccount-form-edit-container">
              <h2>Modifier l'utilisateur</h2>
              <form onSubmit={funcEditSubmit}>
                <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={funcInputChange} />
                <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={funcInputChange} />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={funcInputChange} />
                <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={funcInputChange} />
                <select name="permission" value={formData.permission} onChange={funcInputChange}>
                  <option value="">Permission</option>
                  <option value="administrateur">Administrateur</option>
                  <option value="adherent">Adhérent</option>
                </select>
                <button type="submit">Modifier</button>
                <button onClick={toggleEditForm}>Annuler</button>
              </form>
            </div>
          </div>
        )}

        <div id="messageContainer" style={{color: "green" }}>{returnMessage}</div>

        <div className="account-grid">
          {userAccounts.map((user, index) => (
            <div key={index} className="account-grid-item">
              <div><strong>Nom:</strong> {user.nom}</div>
              <div><strong>Prénom:</strong> {user.prenom}</div>
              <div><strong>Permission:</strong> {user.permission}</div>
              <div className="account-actions-container">
                <FontAwesomeIcon icon={faEdit} onClick={() => funcEditClick(user.idUtilisateur)} />
                <FontAwesomeIcon icon={faTrashAlt} onClick={() => funcDeleteSubmit(user.idUtilisateur)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AccountManagement;

