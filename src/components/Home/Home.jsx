import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import { Spinner } from 'reactstrap';

import { useToasts } from 'react-toast-notifications';
import swal from '@sweetalert/with-react'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import apiConfig from '../../config/api';

function Home(props) {
    const { department, level, course, school } = props.match.params
    const { addToast } = useToasts();
    const [isUploading, setIsUpLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [file, setFile] = useState("")
    const [link, setLink] = useState("")
    const [files, setFiles] = useState([])
    const [once, setOnce] = useState(0)
    const [search_result, setSearchResult] = useState([])
    const [file_struct, setFileStruct] = useState(null)
    const [courseMaterialError, setCourseMaterialError] = useState(false)
    useEffect(() => {
        setOnce(1)
        getFiles()
    }, [once])




    function search(text) {
        let result = []
        for (let i of files) {
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

    async function saveMaterial() {
        let file_s = {}
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
            setCourseMaterialError(true)
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
                "dept": department,
                "level": level,
                "last_updated": new Date(Date.now()).toDateString(),
                "school": school,
                "lectures": [
                    file_s
                ]
            })
        })
        const result = await response.json()
        console.log(result)
        if (result.status === "success") {
            await getFiles()
            swal.close()
            addToast('Material saved to Database', { appearance: 'success' });
            setLink("")
            setFileStruct(null)
            window.scrollTo(0, 0)
            swal("Successfully saved material", "You can keep adding material files or close modal if you are done", "success");
            return
        }
        swal.close()
        addToast('There is an issue with the network at this point please try again', { appearance: 'error' });
    }
    async function getFiles() {

        swal(
            <div>
                <Spinner color="danger" />
                <p className="text-center">Fetching course materials...</p>
            </div>
            , {
                closeOnClickOutside: false,
                buttons: false
            })
        let response = await fetch(`${apiConfig.root}/get-course-material/${department}/${level}/${course}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/JSON"
            }
        })
        const result = await response.json()

        if (result.status === "success") {
            let count = localStorage.getItem("count");
            count = JSON.parse(count)

            let reverse = result.body.reverse()

            localStorage.setItem("count", JSON.stringify({ count: reverse.length }))
            setFiles(reverse)
            swal.close()
            // addToast('List updated', { appearance: 'success' });
            return
        }
        swal.close()
        addToast('Cannot update list, please reload page', { appearance: 'error' });
    }
    // function saveLink() {
    //     console.log(link.slice(8, 24), link)
    //     const file_struture = {
    //         name: link.slice(8, 24),
    //         type: "text/UTF-8",
    //         date_added: new Date(Date.now()).toDateString(),
    //         size: 1,
    //         download_link: link
    //     }

    //     sendToServer(file_struture)

    // }
    async function deleteFile(course, name) {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this file!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(async (willDelete) => {
                if (willDelete) {
                    swal(
                        <div>
                            <Spinner color="danger" />
                            <p className="text-center">Deleting material, please wait...</p>
                        </div>
                        , {
                            closeOnClickOutside: false,
                            buttons: false
                        })
                    let response = await fetch(`${apiConfig.root}/delete-file/${course}/${name}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/JSON"
                        }
                    })
                    let result = await response.json()
                    if (result.status === "success") {
                        console.log(result)
                        swal.close()
                        addToast('File deleted successfully', { appearance: 'success' });
                        getFiles()

                        return
                    }
                } else {
                    swal.close()
                }
            });
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
                    addToast('Upload succcessful, click Save File to save completely', { appearance: 'success' });
                    setFileStruct(file_struture)
                    console.log(file_struture)
                });
            }
        );
    }
    return (
        < div className="col-12">

            <div className="container">
                < h1 className="text-center mt-4">{department} - {level} Level</h1>
                < h4 className="text-center mt-4">{course}</h4>
                {/* <div className="row home">
                    <div className="col-md-6 offset-md-3 justify-content-between d-flex align-items-center">
                        <span>{isUploading ? `Uploading....${Math.floor(progress)}% complete` : "Select File to upload: "}</span>
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
                </div> */}
                <div className="row home">
                    <div className="col-md-6 offset-md-3 justify-content-between d-flex align-items-center">
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

                                //  autoFocus
                                placeholder="Search material name"
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
                </div>
                <div >

                </div>
                <div className="row home">


                    <div className="col-md-6 offset-md-3">
                        <button type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop" style={{ borderRadius: "50%", color: "rgba(0,0,0,0.4)", backgroundColor: "rgba(0,0,0,0.05)", borderWidth: 0.1, float: "right", fontSize: 13, marginBottom: 10, marginTop: -10 }} className="btn btn-light kl">
                            <i class="fas fa-plus"></i>
                        </button>

                        <ol className="list-group col-md-12 ">
                            {
                                search_result.length > 0 ?

                                    search_result.map((file) => {
                                        return (

                                            <li className="list-group-item d-flex justify-content-between align-items-start">
                                                <div className="ms-2 me-auto">
                                                    <div className="fw-bold file-info-bold">{file.name.slice(0, 20)} - {file.type.slice(0, 20)}</div>
                                                    <div className="file-info">Size: {file.size}MB</div>
                                                    <div className="file-info">Date added: {file.date_added}, {new Date(file.date_added).toLocaleTimeString()}</div>
                                                </div>
                                                <div className="mx-1">
                                                    <a href={file.download_link} target="_blank" download><span className="badge bg-primary rounded-pill"> {file.type == "text/UTF-8" ? "Open link" : "Download"}{file.type != "text/UTF-8" ? <i className="fas fa-download"></i> : <i class="fas fa-arrow-right"></i>} </span> </a>
                                                </div>
                                                <div className="mx-1">
                                                    <span onClick={async () => await deleteFile(course, file.name)}className="badge bg-danger rounded-pill"> <i className="fas fa-trash-alt"></i></span>
                                                </div>
                                            </li>
                                        )
                                    }) :
                                    files.length > 0 ?

                                        files.map((file) => {
                                            return (

                                                <li className="list-group-item ">
                                                    <div className="ms-2 me-auto">
                                                        <div className="fw-bold file-info-bold">{file.name.slice(0, 20)} - {file.type.slice(0, 20)}</div>
                                                        <div className="file-info">Size: {file.size}MB</div>
                                                        <div className="file-info">Date added: {file.date_added}, {new Date(file.date_added).toLocaleTimeString()}</div>
                                                    </div>
                                                    <div className="row d-flex justify-content-end p-0 ">

                                                        <div className="col-3">
                                                            <a href={file.download_link} target="_blank" download><span className="badge bg-primary rounded-pill"> {file.type == "text/UTF-8" ? "Open link" : "Download"}{file.type != "text/UTF-8" ? <i className="fas fa-download"></i> : <i class="fas fa-arrow-right"></i>} </span> </a>
                                                        </div>
                                                        <div style={{ margin: "0 20px" }} className="col-2">
                                                            <span onClick={async () => await deleteFile(course, file.name)} className="badge bg-danger rounded-pill"> <i className="fas fa-trash-alt"></i></span>
                                                        </div>

                                                    </div>

                                                </li>
                                            )
                                        })

                                        :
                                        <h5>
                                            No files available for now, please add some files <span>
                                                <i class="far fa-file"></i>
                                            </span>
                                        </h5>
                            }



                        </ol>
                    </div>

                </div>

            </div>
            <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered  modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Add file or link of {course} course material</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="exampleInputPassword1" class="form-label  my-2 jk"> </label>
                                {
                                    courseMaterialError && <div style={{ borderColor: "red", borderRadius: 10, padding: 6, marginBottom: 10 }} className="alert-danger">
                                        Please upload a course material or type in link to material
                                    </div>
                                }
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
                                                if (e.target.files[0]) {
                                                    setFile(e.target.files[0])
                                                    setCourseMaterialError(false)
                                                    await handleUpload(e.target.files[0])
                                                }
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
                                                    setCourseMaterialError(false)
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

                        </div>
                        <div class="modal-footer">
                            {/* <button type="button"  className="btn btn-secondary" data-bs-dismiss="modal">Close</button> */}
                            <button type="button" onClick={async (e) => {

                                await saveMaterial()

                            }} class="btn btn-primary">Save File <i className="far fa-save"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Home
