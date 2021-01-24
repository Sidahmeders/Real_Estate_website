import React, { useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/houseUpload/houseUpload.css';
import axios from 'axios';
import { ContextConsumer } from '../context';
import ErrorMsg from './auth/errorMsg';
import { showErr } from './auth/errorMsg';


function HouseUpload() {

    const context = useContext(ContextConsumer);
    const { auth } = context;
    const { token } = auth;

    const useLocalState = () => {
        const myHouse = localStorage.getItem("newHouse");
        const [locState, setState] = useState(JSON.parse(myHouse));

        const setLocState = newItem => {
            localStorage.setItem("newHouse", JSON.stringify(newItem));
            setState(newItem);
        }

        return [locState, setLocState];
    }

    const [upLoadedFile, setUpLoadedFile] = useLocalState({});

    const [userFiles, setUserFiles] = useState({
        file: "",
        tempFile: "",
        address: "",
        phoneNumber: ""
    });

    const onFileChange = e => {
        setUserFiles({
            ...userFiles,
            file: e.target.files[0],
            tempFile: URL.createObjectURL(e.target.files[0])
        });
    };

    const onHouseDataChange = e => {
        const value = e.target.value;
        setUserFiles({
            ...userFiles,
            [e.target.name]: value
        });
    };

    const onFileSubmit = async e => {
        e.preventDefault();

        const fd = new FormData();
        for(let file in userFiles) {
            fd.append(file, userFiles[file]);
        }
        const res = await axios.post('/uploads', fd, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'x-auth-token': token
            },
            onUploadProgress: progressEvent => {
                console.log('Upload progress:', Math.round(progressEvent.loaded / progressEvent.total * 100) + "%")
            }
        });

        try {
            const {address, phoneNumber, base64String} = res.data;
            setUpLoadedFile({address, phoneNumber, base64String});
            setUserFiles({
                file: "",
                tempFile: "",
                address: "",
                phoneNumber: ""
            });

        } catch(err) {
            if(err) {
                console.log('this is Server problem');
            } else {
                console.log(err.response.data.msg);
            }
        }
        showErr();
    };

    const inputEl = useRef()
    const focusInput = () => {
        inputEl.current.click()
    }

    return(
        <div className="house-upload">
            <h1>HouseUpload</h1>
            <div id="err-msg" className="hide">
                <ErrorMsg />
            </div>
            <div className="house-input-info">
                <form onSubmit={onFileSubmit}>

                    <label>Your House Address</label>
                    <input type="text" name="address"
                    value={userFiles.address} onChange={onHouseDataChange} 
                    />
                    <label>Your Phone number</label>
                    <input type="number" name="phoneNumber"
                    value={userFiles.number} onChange={onHouseDataChange}
                    />
                    <label>Upload your House image</label>
                    <input type="file" name="file" onChange={onFileChange} 
                      ref={inputEl} style={{display:"none"}} />
                    <p onClick={focusInput}
                    style={{
                        border:"2px solid blue",
                        display:"inline-block",
                        margin:"3px 30px",
                        padding:"3px 6px",
                        color:"blue",
                        cursor:"pointer"
                    }}>
                        pick house Img
                    </p>
                    
                    <button>UpLoad</button>
                </form>
                <Link to="/houseUpload/confirm">confirm</Link>
                <h1>{userFiles.address}</h1>
                <img width="450px" src={userFiles.tempFile} alt="myfile" />
                <h4>phone: {userFiles.phoneNumber}</h4>
            </div>
        </div>
    );
}

export default HouseUpload;
