import React, { useContext, useState } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import './AccountAuth.css';
import { UserContext } from '../../App';
import { useHistory, useLocation } from 'react-router';

if (!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

const AccountAuth = () => {
    const [validCPass1, setValidCPass1] = useState('');
    const [validCPass2,  setValidCPass2] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [validPassword, setValidPassword] = useState(false);
    const [newUser, setNewUser] = useState(false);
    const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    
  });
  
  const[loggedInUser, setLoggedInUser] = useContext(UserContext);
  const history = useHistory();
  const location = useLocation();
  const { from } = location.state || { from: { pathname: "/" } };

  const googleProvider = new firebase.auth.GoogleAuthProvider();
  console.log(loggedInUser);

  const handleSignIn = () => {
    firebase.auth().signInWithPopup(googleProvider)
    .then(res => {
      const {displayName, email} = res.user;
      const signedInUser = {
        isSignedIn: true,
        name: displayName,
        email: email
      };
      setUser(signedInUser);
      history.replace(from);
    })
    .catch(err => {
      console.log(err);
      console.log(err.message);
    })
  }
  
  //handle blur
  const handleBlur = (e) => {
    let isFieldValid = true;
    if(e.target.name === 'email'){
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
      if(!isFieldValid){
        setValidEmail(true);
      }
      else{
        setValidEmail(false);
      }
    }
    if(e.target.name === 'password'){
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber =  /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
      if(!isFieldValid){
        setValidPassword(true);
      }
      else{
        setValidPassword(false);
      }
    }
    if(isFieldValid){
      const newUserInfo = {...user};
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);    
    }
  }

  const handleChange1 = (event) =>{
    setValidCPass1(event.target.value);
    //console.log(event.target.value)
  }
  const handleChange2 = (event) =>{
    setValidCPass2(event.target.value);
    //console.log(event.target.value)
  }
  
  //handle submit
  const handleSubmit = (e) => {
    if(newUser && user.email && user.password && validCPass1 === validCPass2){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then( res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        updateUserName(user.name);
      })
      .catch( error => {
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
        history.replace(from);
        //console.log(error);
      });
    }

    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        setLoggedInUser(newUserInfo);
        history.replace(from);
        //console.log('sign in user info', res.user);
      })
      .catch(function(error) {
        const newUserInfo = {...user};
        console.log(error);
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
        console.log(error);
      });
    }

    e.preventDefault();
  }

  //update user information
  const updateUserName = name =>{
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function() {
      //console.log('user name updated successfully')
    }).catch(function(error) {
      console.log(error)
    });
  }

  return (
    <div> 
      {
        user.isSignedIn && setLoggedInUser(user)
      }
      
    <div className='auth-container'>
      {
          newUser ? <h3 className='register'>Create new account</h3> : <h3 className='login'>Login</h3>
      }
      <form onSubmit={handleSubmit}>
        <br/>
        {newUser && <input style={{width: "70%" }} name="name" type="text" onBlur={handleBlur} placeholder="Your name"/>}
        <br/><br/>
        <input style={{width: "70%" }} type="text" name="email" onBlur={handleBlur} placeholder="Your Email address" required/>
        <br/><br/>
        <input style={{width: "70%" }} type="password" name="password" onChangeCapture={handleChange1} onBlur={handleBlur} placeholder="Your Password" required/>
        <br/><br/>
        {newUser && <input style={{width: "70%" }} name="password" type="password" onChangeCapture={handleChange2} onBlur={handleBlur} placeholder="Confirm password"/>}
        <br/>
        {newUser && !(validCPass1 === validCPass2) && <p style={{color: 'red'}}>Password don't match.</p>}
        {
            newUser ? <p></p> : <div>
                  <input type='checkbox'/>
                  <lebel className='space'>Remember me </lebel>
                  <u className='text-click'> Forgot password?</u>
                </div>
        }
        <br/>
        <input className='login-btn' style={{width: "70%" }} type="submit" value={newUser ? 'Create account' : 'Login'}/>
      </form>

      <lebel>{ newUser ? "Already have an account?  " : "Don't have an account?  " }</lebel>
      <u onClick={() => setNewUser(!newUser)} name="newUser" className="text-click">{newUser ? 'Login' : 'Create new account' }</u>
      
      <p style={{color: 'red'}}>{user.error}</p>
      { user.success && <p style={{color: 'green'}}> { newUser ? 'User created successfully. Login Now!' : ''} </p>}
      {validPassword && <p style={{color: 'red'}}>Your Password is invalid. Your password must have 6 characters and atleast 1 number.</p>}
      {validEmail && <p style={{color: 'red'}}>Your email is invalid.</p>}
      </div>
      <br/>
      <p>or</p>
      <button className='google-btn' onClick={handleSignIn}>Continue with Google</button>
            
    </div>
  );
}

export default AccountAuth;
