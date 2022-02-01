import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import { Spinner } from 'reactstrap';

import { useToasts } from 'react-toast-notifications';
import swal from '@sweetalert/with-react'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import apiConfig from '../../config/api';
import departments from './test_data';

function Levels(props) {
    const { department } = props.match.params
    const levels = [
        "100",
        "200",
        "300",
        "400",
        "500"
    ]
    return (
        <div className="col-12">
            <div className="container">
                < h1 className="text-center mt-4">{department}</h1>
                <h5 className="text-center m3-4">Select level</h5>
                <div className="row home">
                    {
                        levels.map((d) => {
                            return (
                                <div className="col-md-2 my-4">

                                    <div className="dept-card levels p-3" onClick={() => {
                                        props.history.push({
                                            pathname: `/courses/${department}/${d}`
                                        })
                                    }}>
                                        <h4>
                                            {d}
                                        </h4>
                                        <div style={{ fontWeight: "lighter", fontSize: 12 }} className="btn btn-light  ">
                                            View Courses  <span className="text-secondary"> <i class="fas fa-book-open"></i></span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }

                </div>







            </div>


        </div>

    )
}
export default Levels
