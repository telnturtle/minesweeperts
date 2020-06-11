import React, { Component } from 'react';
import './App.scss';
import Test from 'test/Test';
import Hi from 'hi/index';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Hi />
          <Test />
        </header>
      </div>
    );
  }
}

export default App;
