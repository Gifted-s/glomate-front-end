import React from 'react'
import { Route, withRouter,Redirect } from "react-router-dom"
function NotFound(props) {
    return (

        <>

            <h1 style={{ marginTop: 120, textAlign: "center", fontSize: 300, color: "rgba(0,0,0,0.3)" }}><i class="fas fa-frown"></i></h1>
            <h3 style={{ marginTop: 120, textAlign: "center" }}>
                Page not found  but no worries, let's get you back <span style={{ borderRadius: 20 }} onClick={() => props.history.push("/")} className="btn btn-primary">home</span> <i class="fas fa-smile"></i>
            </h3>

        </>

    )
}

export default withRouter(NotFound)
