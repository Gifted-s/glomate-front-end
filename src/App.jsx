import React, { useState } from 'react'
import { BrowserRouter, Route, Switch } from "react-router-dom"
import "./App.css"
import Routes from './components/Routes/Routes'
import { ToastProvider, useToasts } from 'react-toast-notifications';
import "react-datetime/css/react-datetime.css";
import './config/firebase';

function App() {
  return (
    <ToastProvider autoDismissTimeout={7000} autoDismiss={true}>
    <div className="App">
      <BrowserRouter>
    
        <Switch>
          <Routes />
        </Switch>
        
      </BrowserRouter>
    </div>
    </ToastProvider>
  )

}



export default App
