import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">
                <Link to="/">Mini Social App</Link>
            </div>
            <nav className="nav">
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/feed">Feed</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;