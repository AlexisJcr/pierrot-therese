import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import iconFacebook from "../assets/icons/facebook.png";
import iconInstagram from "../assets/icons/instagram.png";
import burger from "../assets/icons/menu.png";
import arrow from "../assets/icons/arrow.png"

function Header() {
    const [scrolling, setScrolling] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY; 
            const idAsso = document.getElementById('association'); 

            if (idAsso) {
                const idAssoPos = idAsso.offsetTop; 
                if (scrollPos >= idAssoPos) { 
                    setScrolling(true);
                }
                else {
                    setScrolling(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const headerClassName = `header-area ${scrolling ? 'scrolled' : ''}`;

    const togglemenu = () => {
        const burgerMenu = document.getElementById('menuburger');
        const burgerIcon = document.getElementById('burgericon');
        const headerarea = document.getElementById('headerarea');
        const currentOpacity = parseFloat(window.getComputedStyle(burgerMenu).opacity);

        if (currentOpacity === 0) {
            burgerMenu.style.display = "flex";
            burgerIcon.style.display = "none";
            setTimeout(function () {
                burgerMenu.style.opacity = 1;
            }, 80);
        } else {
            setTimeout(function () {
                burgerMenu.style.display = "none";
                burgerIcon.style.display = "flex";
            }, 80);
            burgerMenu.style.opacity = 0;
        }
    };

    return (
        <header className={headerClassName} id="headerarea">
            <div className="burger-super-navbar" id="menuburger">
                <div className="burger-navbar-top">
                    <ul>
                        <div className="bgd-to-connect">
                            <li className="burger-navbar-element">
                                <Link to="/login">Se connecter</Link> {/*Page de Login*/}
                            </li>
                        </div>
                        <li className="burger-navbar-element">
                            <a href="#accueil">Accueil</a>
                        </li>
                        <li className="burger-navbar-element">
                            <a href="#association">Association</a>
                        </li>
                        <li className="burger-navbar-element">
                            <a href="#missions">Missions</a>
                        </li>
                        <li className="burger-navbar-element">
                            <a href="#evenements">Évènements</a>
                        </li>
                        <li className="burger-navbar-element">
                            <a href="#gallerie">Galerie</a>
                        </li>
                    </ul>
                </div>
                <div className="burger-navbar-bottom">
                    <ul>
                        <li className="burger-navbar-element" onClick={togglemenu}>
                            <img className="burger-arrow" src={arrow} alt="Menu"></img>
                        </li>
                        <li className="burger-navbar-element">
                            <a href="https://www.facebook.com/LePierrotTherese/" target="_blank" rel="noreferrer"><img src={iconFacebook} alt="Facebook" />Facebook</a>
                        </li>
                        <li className="burger-navbar-element">
                            <a href="https://www.instagram.com/le_pierrot_therese?igsh=MXFhcmYwdnk5ZWgzdw==" target="_blank" rel="noreferrer"><img src={iconInstagram} alt="Facebook" />Instagram</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="burger-icon" id="burgericon" onClick={togglemenu}>
                <img src={burger} alt="Menu"></img>
            </div>

            <div className="super-navbar">
                <div className="navbar-left">
                    <ul>
                        <li className="navbar-element">
                            <a href="https://www.facebook.com/LePierrotTherese/" target="_blank" rel="noreferrer"><img src={iconFacebook} alt="Facebook" />Facebook</a>
                        </li>
                        <li className="navbar-element">
                            <a href="https://www.instagram.com/le_pierrot_therese?igsh=MXFhcmYwdnk5ZWgzdw==" target="_blank" rel="noreferrer"><img src={iconInstagram} alt="Facebook" />Instagram</a>
                        </li>
                    </ul>
                </div>
                <div className="navbar-right">
                    <ul>
                        <li className="navbar-element">
                            <a href="#accueil">Accueil</a>
                        </li>
                        <li className="navbar-element">
                            <a href="#association">Association</a>
                        </li>
                        <li className="navbar-element">
                            <a href="#missions">Missions</a>
                        </li>
                        <li className="navbar-element">
                            <a href="#evenements">Évènements</a>
                        </li>
                        <li className="navbar-element">
                            <a href="#gallerie">Galerie</a>
                        </li>
                        <div className="bgd-to-connect">
                            <li className="navbar-element">
                                <Link to="/login">Se connecter</Link> {/*Page de Login*/}
                            </li>
                        </div>
                    </ul>
                </div>
            </div>
        </header>
    );
}

export default Header;