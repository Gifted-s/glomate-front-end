import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import { Spinner } from 'reactstrap';

import { useToasts } from 'react-toast-notifications';
import swal from '@sweetalert/with-react'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import apiConfig from '../../config/api';
import departments from './test_data';

function Courses(props) {
    const {department, level}= props.match.params
    const [text, setText] = useState('')
    const [courses, setCourses] = useState([])
    const [once, setOnce] = useState(0)
    const [link, setLink] = useState("")
    const [search_result, setSearchResult] = useState([])

    useEffect(() => {
        setOnce(1)
        getCourses()
    }, [once])
    function search(text) {
        let result = []
        for (let i of courses) {
            if (i.name.toLowerCase().includes(text.toLowerCase())) {
                if (i.name.toLowerCase().slice(0, text.length) === text.toLowerCase()) {
                    result.unshift(i)
                }
                else {
                    result.push(i)
                }
            }
        }
        setSearchResult(result)
    }
    async function getCourses() {
        swal(
            <div>
                <Spinner color="danger" />
                <p className="text-center">Loading courses...</p>
            </div>
            , {
                closeOnClickOutside: false,
                buttons: false
            })
        let response = await fetch(`${apiConfig.root}/get-courses/${department}/${level}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/JSON"
            }
        })
        const result = await response.json()
        if (result.status === "success") {
           if(result.body !== null){
             setCourses(result.body)
           }
           
            swal.close()
            return
        }
    }
    return (
        <div className="col-12">

            <div className="container">
                < h1 className="text-center mt-3"> {department} - {level} level</h1>
                < h5 className="text-center mt-4"> Select a Course</h5>
                <div className="col-md-6 offset-md-3">
                <span className="justify-content-between col-md-12 d-flex align-items-center">
                            <input
                                type="text" style={{
                                    marginRight: 10,
                                    borderColor: "rgba(0,0,0,0.15)",
                    
                                    padding:"8px 40px",
                                    fontSize:15,
                                    borderRadius:30

                                }}
                        
                               
                                placeholder="Search course"
                                onChange={(e) => {
                                    search(e.target.value)

                                }} className="col-md-12 ns" />
                                <span className="s-icon">
                                <i class="fas fa-search"></i> 
                                </span>
                            {/* <button className="btn btn-primary col-md-3" onClick={() => saveLink()} style={{ borderRadius: 30, fontSize: 16}}>
                             <i class="fas fa-search"></i> 
                            </button> */}
                        </span>
                </div>

                <div className="row home">
                {search_result.length > 0 ? search_result.map((d) => {
                    return(
                        <div className="col-md-3 my-4">
                        <div className="dept-card course p-3" onClick={() => {
                            props.history.push({
                                pathname: `/course/${d.school}/${department}/${level}/${d.name}`
                            })
                        }}>
                            <h4>
                                {d.name}
                            </h4>
                            <div style={{ fontWeight: "lighter", fontSize: 12 }} className="btn btn-light  ">
                                View Lecture Notes  <span className="text-secondary"> <i class="fas fa-book-open"></i></span>
                            </div>
                        </div>
                    </div>
                    )
                })
                :
                courses.length ? courses.map((d) => {
                    return (
                        <div className="col-md-3 my-4">
                            <div className="dept-card course p-3" onClick={() => {
                                props.history.push({
                                    pathname: `/course/${d.school}/${department}/${level}/${d.name}`
                                })
                            }}>
                                <h4>
                                    {d.name}
                                </h4>
                                <div style={{ fontWeight: "lighter", fontSize: 12 }} className="btn btn-light  ">
                                    View Lecture Notes  <span className="text-secondary"> <i class="fas fa-book-open"></i></span>
                                </div>
                            </div>
                        </div>
                    )
                })
                :
                <div>
                    <h4 className="text-center my-3">No course found, please contact support</h4>
                    </div>
                
            }
                </div>







            </div>


        </div>

    )
}
export default Courses
