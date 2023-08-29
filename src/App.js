import logo from './logo.svg';
import './App.css';

import React, { useState } from 'react';
import AudioPlayer from "./AudioPlayer";

function App() {


    return (
        <div className="App">
            <header className="App-header">
                <h1>Audio Player App</h1>
                <AudioPlayer />
            </header>
        </div>
    );
}

export default App;
