import React, { Component } from 'react';
import './App.css';
import Test from 'test/Test';
import Hi from 'hi/index';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Hi />
        <header className="App-header">
          <Test />
        </header>
      </div>
    );
  }
}

export default App;
