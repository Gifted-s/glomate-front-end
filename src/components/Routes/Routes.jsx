import React from 'react'
import { Route, withRouter,Redirect } from "react-router-dom"
import Add_Material from '../Home/Add_Material'
import Courses from '../Home/Courses'
import Departments from '../Home/Dept'
import Footer from '../Home/Footer'
import Home from '../Home/Home'
import Levels from '../Home/levels'
import NotFound from '../Home/NotFound'

function Routes(props) {
    return (
        <>

            <div >
                <button style={{ position: "absolute", left: 10, top: 20, borderRadius: 18 }} onClick={() => {
                    props.history.push("/")
                }} className="btn btn-primary">
                    <i class="fas fa-home"></i> Go home 
                </button>
            </div>
            <div >
                <button style={{ position: "absolute", right: 10, top: 20, borderRadius: 18 }} onClick={() => {
                    props.history.push("/add-material")
                }} className="btn btn-primary">
                    Add Material <i class="fas fa-plus"></i>
                </button>
            </div>
            <div style={{ marginTop: 70 }}>
                <Route path="/" exact component={Departments} ></Route>
                <Route path="/courses/:department/:level"  component={Courses} ></Route>
                <Route path="/course/:school/:department/:level/:course"  component={Home} ></Route>
                <Route path="/levels/:department"  component={Levels} ></Route>
                <Route path="/add-material" component={Add_Material} ></Route>
                {/* <Route  exact={true} component={NotFound} /> */}
                <Footer />
               
            </div>

        </>
    )
}

export default withRouter(Routes)
