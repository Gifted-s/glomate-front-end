import React from 'react'
import {Route} from "react-router-dom"
import Home from '../Home/Home'

function Routes() {
    return (
        <>
             <Route path="/" exact component={Home} ></Route>
        </>
    )
}

export default Routes
