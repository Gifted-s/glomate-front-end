import React, { useState, useEffect, useRef } from 'react'
import { Link } from "react-router-dom"
import { Spinner } from 'reactstrap';

import { useToasts } from 'react-toast-notifications';
import swal from '@sweetalert/with-react'
import { getStorage, ref, uploadBytesResumable, getDownloadURL, connectStorageEmulator } from "firebase/storage";
import apiConfig from '../../config/api';
function Departments(props) {
    const [departments, setDepartments] = useState([])
    const [once, setOnce] = useState(0)
    const [search_result, setSearchResult] = useState([])
    const [construct_string, setConstructString] = useState([])
    const [page, setPage] = useState(0)
    const [searchingSchool, setSearchSchool] = useState(false)
    const [page_size, setPageSize] = useState(0)
    const [schools, setSchools] = useState([])
    const [navBackground, setNavBackground] = useState(false)
    const navRef = useRef()
    navRef.current = navBackground
    useEffect(() => {
        setOnce(1)
        getDepartments()
        const handleScroll = () => {
            const show = window.scrollY > 50
            if (navRef.current !== show) {
                setNavBackground(show)
            }
        }
        document.addEventListener('scroll', handleScroll)
    }, [once])

    function search(text) {
        window.scrollTo(0, 0)
        setPage(0)
        setSearchSchool(false)
        let result = []
        let temp_construct_string = []
        for (let i of departments) {
            if (i.name.toLowerCase().includes(text.toLowerCase())) {
                let index = i.name.toLowerCase().search(text.toLowerCase())

                if (i.name.toLowerCase().slice(0, text.length) === text.toLowerCase()) {
                    temp_construct_string.unshift([i.name.slice(0, index), text, i.name.slice(index + text.length)])
                    result.unshift(i)
                }
                else {
                    temp_construct_string.push([i.name.slice(0, index), text, i.name.slice(index + text.length)])
                    result.push(i)
                }
            }

        }
        if (result.length === departments.length) {
            setSearchResult([])
            setConstructString([])
        }
        else {
            setSearchResult(result)
            setConstructString(temp_construct_string)
        }
    }

    function searchSchool(text) {
        setPage(0)
        window.scrollTo(0, 0)
        setSearchSchool(true)
        let result = []
        let temp_construct_string = []
        for (let i of departments) {
            if (i.school.toLowerCase().includes(text.toLowerCase())) {
                let index = i.school.toLowerCase().search(text.toLowerCase())

                if (i.school.toLowerCase().slice(0, text.length) === text.toLowerCase()) {
                    temp_construct_string.unshift([i.school.slice(0, index), text, i.school.slice(index + text.length)])
                    result.unshift(i)
                }
                else {
                    temp_construct_string.push([i.school.slice(0, index), text, i.school.slice(index + text.length)])
                    result.push(i)
                }
            }

        }
        if (result.length === departments.length) {
            setSearchResult([])
            setConstructString([])
            setSearchSchool(false)
        }
        else {
            setSearchResult(result)
            setConstructString(temp_construct_string)
        }
    }
    async function getDepartments() {
        swal(
            <div>
                <Spinner color="danger" />
                <p className="text-center">Loading Departments...</p>
            </div>
            , {
                closeOnClickOutside: false,
                buttons: false
            })
        let response = await fetch(`${apiConfig.root}/get-departments`, {
            method: "GET",
            headers: {
                "Content-Type": "application/JSON"
            }
        })
        const result = await response.json()
        if (result.status === "success") {
            if (result.body) {
                console.log(Math.floor(result.body.length / 8), "size")
                setPageSize(Math.floor(result.body.length / 8))
                // console.log(result.body.length / 8)
                setDepartments(result.body.sort(function (a, b) {
                    if (a.name < b.name) { return -1; }
                    if (a.name > b.name) { return 1; }
                    return 0;
                }))
                let fetched_schools = new Set()
                for (let i of result.body) {
                    fetched_schools.add(i.school)
                }
                let fetched_schools_array = Array.from(fetched_schools)
                setSchools(fetched_schools_array)
            }
            swal.close()
            return
        }
    }
    return (
        <div className="col-12">

            <div className="container">
                < h1 className="text-center mt-4 yu">Departments</h1>
                {searchingSchool && <p className="my-2"> <span style={{ color: "black" }}>School of {search_result[0].school}</span>   </p>}
                <div style={{ transition: '1s ease', backgroundColor: navBackground ? 'rgba(0,0,0,0.8)' : 'transparent', position: "fixed", top: window.innerWidth<=768  ? navBackground ?0 : 60: 0 }} className="col-md-6 offset-md-1 justify-content-between d-flex align-items-center sr">
                    {/* {
                            link.length > 0 && <span>{isUploading ? `Uploading....${Math.floor(progress)}% complete` : ""}</span>
                        } */}
                    <span className="justify-content-between col-md-12 d-flex align-items-center">
                        <input
                            type="text" style={{
                                marginRight: 10,
                                borderColor: "rgba(0,0,0,0.15)",
                                padding: "8px 40px",
                                fontSize: 15,
                                borderRadius: 30

                            }}
                            // autoFocus
                            placeholder="Search for your department"
                            onChange={(e) => {
                                search(e.target.value)

                            }} className="col-md-12 ns" />
                        <span className="s-icon">
                            <i className="fas fa-search"></i>
                        </span>

                        <li className="nav-item dropdown btn btn-primary col-md-3" style={{ borderRadius: 30, fontSize: 13 }}>
                            <a className="nav-link fl" style={{ color: "white", padding: 3 }} data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"> filter with school  <i class="fas fa-sort-amount-down"></i></a>
                            <div className="dropdown-menu">
                                {
                                    schools.map((s) => {
                                        return (
                                            <a onClick={() => searchSchool(s)} className="dropdown-item my-4" href="#">{s}</a>
                                        )
                                    })
                                }


                            </div>
                        </li>
                    </span>
                </div>

                <div className="row home">
                    {search_result.length > 0 ? search_result.map((d, i) => {
                        return (
                            <div className="col-md-3 my-4">
                                <div className="dept-card p-3" onClick={() => {
                                    props.history.push({
                                        pathname: `/levels/${d.name}`
                                    })
                                }}>
                                    {
                                        searchingSchool ?
                                            <h4>{d.name}</h4>
                                            :
                                            <h4>
                                                {construct_string[i][0]}<span style={{ color: "yellow" }}>{construct_string[i][1]}</span>{construct_string[i][2]}
                                            </h4>
                                    }
                                    <hr />
                                    {
                                        searchingSchool ?
                                            <p> <span style={{ color: "yellow" }}>{construct_string[i][1]}</span>   </p>
                                            :
                                            <p>{d.school}</p>

                                    }


                                    <p>Updated: {d.last_updated}</p>
                                    <div style={{ fontWeight: "lighter", fontSize: 12 }} className="btn btn-light  ">
                                        View levels  <span className="text-secondary"> <i class="fas fa-layer-group"></i></span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                        :
                        departments.length > 0 ? departments.slice(page * 8, (page * 8) + 8).map((d) => {
                            return (
                                <div className="col-md-3 my-4">
                                    <div className="dept-card p-3" onClick={() => {
                                        props.history.push({
                                            pathname: `/levels/${d.name}`
                                        })
                                    }}>
                                        <h4>
                                            {d.name}
                                        </h4>
                                        <hr />
                                        <p>{d.school}</p>
                                        <p>Updated: {d.last_updated}</p>
                                        <div style={{ fontWeight: "lighter", fontSize: 12 }} className="btn btn-light  ">
                                            View levels  <span className="text-secondary"> <i class="fas fa-layer-group"></i></span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                            :
                            <div>
                                <h4 className="text-center my-3">No department found yet, please contact support</h4>
                            </div>
                    }



                </div>






                <div className=" d-flex justify-content-end align-items-center">
                    <span className="pg">
                        Page:
                    </span>
                    {
                        Array(page_size).fill().map((number, i) => {
                            return (
                                <div style={{ padding: "10px 20px" }} onClick={() => { setPage(i); setSearchSchool(false); setSearchResult([]); window.scrollTo(0, 0) }} className={page === i ? "btn mx-1 btn-secondary text-light" : "btn mx-1 btn-light text-secondary"}>
                                    {i + 1}
                                </div>
                            )
                        })

                    }
                </div>
            </div>


        </div>

    )
}
export default Departments
