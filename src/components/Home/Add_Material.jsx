import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import { Spinner } from 'reactstrap';

import { useToasts } from 'react-toast-notifications';
import swal from '@sweetalert/with-react'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import apiConfig from '../../config/api';
function Add_Material() {

    const { addToast } = useToasts();
    const [isUploading, setIsUpLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [file, setFile] = useState("")
    const [link, setLink] = useState("")
    const [files, setFiles] = useState([])
    const [once, setOnce] = useState(0)
    const [departments, setDepartments] = useState([])
    const [schools, setSchools] = useState([])
    const [department, setDepartment] = useState("")
    const [level, setLevel] = useState("Select Level")
    const [open_department, setDepartmentOpen] = useState(false)
    const [open_course, setCourseOpen] = useState(false)
    const [open_school, setOpenSchool] = useState(false)
    const [schoool, setSchool] = useState("")
    const [courses, setCourses] = useState([])
    const [course, setCourse] = useState("")
    const [file_struct, setFileStruct] = useState(null)

    useEffect(() => {
        setOnce(1)
        getDepartments()
    }, [once])
    const levels = [
        "100",
        "200",
        "300",
        "400",
        "500"
    ]
    async function saveMaterial() {
        let file_s;
        if (file_struct) {
            file_s = file_struct
        } else if (link) {
            file_s = {
                name: link.slice(8, 24),
                type: "text/UTF-8",
                date_added: new Date(Date.now()).toDateString(),
                size: 1,
                download_link: link
            }

        }
        else {
            addToast('Please add material file or link', { appearance: 'error' });
            return
        }

        swal(
            <div>
                <Spinner color="danger" />
                <p className="text-center">Saving to Database...</p>
            </div>
            , {
                closeOnClickOutside: false,
                buttons: false
            })
        let response = await fetch(`${apiConfig.root}/add-course`, {
            method: "POST",
            headers: {
                "Content-Type": "application/JSON"
            },
            body: JSON.stringify({
                "name": course,
                "dept":department,
                "level": level,
                "last_updated": new Date(Date.now()).toDateString(),
                "school": schoool,
                "lectures": [
                    file_s
                ]
            })
        })
        const result = await response.json()
        if (result.status === "success") {
            await getDepartments()
            swal.close()
            addToast('Material saved to Database', { appearance: 'success' });
            setLink("")
            //setFileStruct(null)
            window.scrollTo(0,0)
            return
        }
        swal.close()
        addToast('There is an issue with the network at this point please try again', { appearance: 'error' });
    }
    function saveLink() {
        console.log(link.slice(8, 24), link)
        const file_struture = {
            name: link.slice(8, 24),
            type: "text/UTF-8",
            date_added: new Date(Date.now()).toDateString(),
            size: 1,
            download_link: link
        }

        console.log(file_struture, "link")
        //sendToServer(file_struture)

    }
    async function getCourses(l) {
        swal(
            <div>
                <Spinner color="danger" />
                <p className="text-center">Loading courses...</p>
            </div>
            , {
                closeOnClickOutside: false,
                buttons: false
            })
        let response = await fetch(`${apiConfig.root}/get-courses/${department}/${l}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/JSON"
            }
        })
        const result = await response.json()
        if (result.status === "success") {
            if (result.body !== null) {
                setCourses(result.body)
            }

            swal.close()
            return
        }
    }

    async function getDepartments() {
        swal(
            <div>
                <Spinner color="danger" />
                <p className="text-center">Loading page.</p>
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
                setDepartments(result.body.sort(function(a, b){
                    if(a.name < b.name) { return -1; }
                    if(a.name > b.name) { return 1; }
                    return 0;
                }))
                //   setDepartment(result.body[0].name)
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

    async function sendToServer(file_struture) {

        swal(
            <div>
                <Spinner color="danger" />
                <p className="text-center">Saving to Database...</p>
            </div>
            , {
                closeOnClickOutside: false,
                buttons: false
            })
        let response = await fetch(`${apiConfig.root}/upload-file`, {
            method: "POST",
            headers: {
                "Content-Type": "application/JSON"
            },
            body: JSON.stringify(file_struture)
        })
        const result = await response.json()
        if (result.status === "success") {
            swal.close()
            addToast('File saved to Database', { appearance: 'success' });
            setLink("")
           
            return
        }
        swal.close()
        addToast('There is an issue with the network at this point please try again', { appearance: 'error' });
    }




    async function handleUpload(fle) {
        setIsUpLoading(true)
        console.log(fle)
        swal(
            <div>
                <Spinner color="danger" />
                <p className="text-center">Uploading file...</p>
            </div>
            , {
                closeOnClickOutside: false,
                buttons: false
            })
        setProgress(1)
        const storage = getStorage();

        // Create the file metadata
        /** @type {any} */
        const metadata = {

        };

        // Upload file and metadata to the object 'images/mountains.jpg'
        const storageRef = ref(storage, 'blogs/' + fle.name);

        const uploadTask = uploadBytesResumable(storageRef, fle, metadata);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
            (snapshot) => {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress)
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        addToast('sorry you cannot access the storage service ', { appearance: 'error' });
                        swal.close()
                        break;
                    case 'storage/canceled':
                        addToast('canceled ', { appearance: 'success' });
                        swal.close()
                        // User canceled the upload
                        break;
                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        addToast('There was an error', { appearance: 'error' });
                        swal.close()
                        break;
                }
            },
            () => {
                // Upload completed successfully, now we can get the download URL
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                    //                     lastModified: 1640472733008
                    // lastModifiedDate: Sat Dec 25 2021 23:52:13 GMT+0100 (West Africa Standard Time) {}
                    // name: "Screen Shot 2021-12-25 at 11.52.07 PM.png"
                    // size: 4389163
                    // type: "image/png"
                    // webkitRelativePath: ""
                    const file_struture = {
                        name: fle.name,
                        type: fle.type,
                        date_added: new Date(Date.now()).toDateString(),
                        size: parseFloat((fle.size / 1000000).toFixed(2)),
                        download_link: url
                    }

                    //console.log('File available at', file_struture);

                    setProgress(0)
                    setIsUpLoading(false)
                    setFile("")
                    swal.close()
                    addToast('Upload succcessful, click submit to complete the saving', { appearance: 'success' });
                    setFileStruct(file_struture)
                    console.log(file_struture)
                    //sendToServer(file_struture)
                });
            }
        );
    }
    return (

        <form className="col-md-6  offset-md-3 u p-4">
            <h3 className="text-center">Add Material</h3>

            <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label">Department: </label>
                <select value={department} class="form-select" onChange={async (e) => {
                    setDepartment(e.target.value);
                    let d = departments.find((d) => d.name === e.target.value)
                    setSchool(d.school)
                    //await getCourses()
                }} aria-label="Default select example">
                    <option value="">Select Department</option>
                    {
                        departments.map((d) => {
                            return (
                                <option value={d.name}>{d.name}</option>
                            )
                        })
                    }

                </select>
                {open_department && <input onChange={(e) => {
                    setDepartment(e.target.value)
                }} type="text" class="form-control mt-1"
                    placeholder="Enter department name"
                />}
                <button type="button" onClick={() => {
                    setDepartmentOpen(!open_department)
                }} className="btn btn-primary mt-1 ur">
                    {open_department ? <i class="far fa-window-close"></i> : ("Add new department")}
                </button>

            </div>


            <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label">School: </label>

                <select disabled={!open_department} value={schoool} onChange={async (e) => {
                    setSchool(e.target.value);

                }} class="form-select" aria-label="Default select example">
                    {open_department && <option value="">Select School</option>}
                    {
                        schools.map((sch) => {
                            return (
                                <option value={sch}>{sch}</option>
                            )
                        })
                    }
                </select>
                {open_school && <input onChange={(e) => {
                    setSchool(e.target.value)
                }} type="text" class="form-control mt-1"
                    placeholder="Enter school name"
                />}
                <button type="button" onClick={() => {
                    setOpenSchool(!open_school)
                }} className="btn btn-primary mt-1 ur">
                    {open_school ? <i class="far fa-window-close"></i> : ("Add new school")}
                </button>


            </div>

            <div class="mb-3">
                <label for="exampleInputPassword1" class="form-label">Level: </label>
                <select value={level} onChange={
                    async (e) => {
                        setLevel(e.target.value);
                        await getCourses(e.target.value)


                    }} class="form-select" aria-label="Default select example">
                    <option value="">Select Level</option>
                    {
                        levels.map((l) => {
                            return (
                                <>
                                    <option value={l}>{l}</option>
                                </>
                            )
                        })
                    }
                </select>
            </div>

            <div class="mb-3">
                <label for="exampleInputPassword1" class="form-label">Select Course: </label>

                <select onChange={(e)=>{
                  setCourse(e.target.value)
                }} class="form-select" aria-label="Default select example">
                    <option >Select level to view courses</option>
                    {
                        courses.length > 0 ?
                            courses.map((c) => {
                                return (
                                    <option value={c.name}>{c.name}</option>
                                )
                            })
                            :
                            null
                    }



                </select>

                {open_course && <input onChange={(e)=>{
setCourse(e.target.value)
                }} type="text" class="form-control mt-1"
                    placeholder="Enter course name"
                />}
                <button
                    type="button"
                    onClick={() => {
                        setCourseOpen(!open_course)
                    }}

                    className="btn btn-primary mt-1 ur">
                    {open_course ? <i class="far fa-window-close"></i> : "Add new course"}

                </button>
            </div>

            <div class="mb-3">
                <label for="exampleInputPassword1" class="form-label  my-2 jk">Add file or link of material: </label>
                <div className="row">


                    <div className="col-md-6">


                        <label for="exampleInputPassword1" class="form-label">{isUploading ? `Uploading....${Math.floor(progress)}% complete` : `Select material file: 
                    
                    ( applicable if material exist in .pdf, .doc, docx, png, jpg , .pptx, pptm, .ppt,  .mp3, .mp4, .zip, .pps and .txt )`}</label>
                        <input style={{
                            borderRadius: "7%",
                            border: "none",
                            justifyContent: "center",
                            alignItems: "center",
                            display: "flex",
                            width: 180,

                        }}
                            onChange={async (e) => {
                                setFile(e.target.files[0])

                                await handleUpload(e.target.files[0])

                            }} type="file" />
                    </div>


                    <span className="mb-3 col-md-1"><b>OR</b></span>

                    <div className="col-md-5">
                        <label for="exampleInputPassword1" class="form-label">Add link to Material(applicable if material can be found on a web page): </label>
                        {
                            link.length > 0 && <span>{isUploading ? `Uploading....${Math.floor(progress)}% complete` : ""}</span>
                        }
                        <span className="justify-content-between col-md-12 d-flex align-items-center">
                            <input
                                type="text" style={{
                                    marginRight: 10,
                                    borderColor: "rgba(0,0,0,0.15)",

                                    padding: "8px 40px",
                                    fontSize: 15,
                                    borderRadius: 30

                                }}
                                value={link}
                                placeholder="enter link here"
                                onChange={(e) => {
                                    setLink(e.target.value)

                                }} className="col-md-12 ns" />
                            <span className="s-icon">
                                <i class="fas fa-link"></i>
                            </span>
                            {/* <button className="btn btn-primary col-md-2" onClick={() => saveLink()} style={{ borderRadius: 30, fontSize: 16 }}>
                            <i class="fas fa-search"></i>
                        </button> */}
                        </span>
                    </div>
                </div>
            </div>

            <div className="my-3">
                <button type="button" style={{ fontWeight: "bolder" }} onClick={() => {
                    saveMaterial()
                }} className="btn btn-primary form-control ur py-3 ">
                    Submit
                </button>
            </div>






        </form>


    )
}

export default Add_Material
