import { useState, useEffect } from 'react';
import axios from 'axios';

// styles
import GlobalStyles from "./GlobalStyles";

// react router
import { Route, Switch, useHistory } from 'react-router-dom';

// pages
import HomePage from "./pages/HomePage";
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ArticlePage from "./pages/ArticlePage.js";
import CreateUser from "./pages/CreateUser.js";
import EditPostPage from "./pages/EditPostPage";
import CreatePostPage from "./pages/CreatePostPage";
import LoginPage from "./pages/LoginPage.js";
import SignUpPage from "./pages/SignUpPage.js";
import ProfilePage from "./pages/ProfilePage";


// components
import Nav from "./components/Nav";
import Footer from "./components/Footer";


function App() {

  	const [ password, setPassword ] = useState('');
	const [ user, setUser] = useState('');
  	const [ username, setUsername] = useState('');
	const [ isLoggedIn, setLoggedIn ] = useState(false);
	const [ role, setRole ] = useState("");
	const [ lastLogin, setLastLogin ] = useState("");
	const [ isLoading, setLoading ] = useState(false);

  const history = useHistory();

	function handleDate(){
        const current = new Date();
        const date = `${current.getMonth()+1}/${current.getDate()}/${current.getFullYear()} @ ${current.getHours()}:${current.getMinutes()}`;
        setLastLogin(date);
    }

	function handleTokens() {
		let tokenPW = sessionStorage.getItem("tokenPW");
		let tokenUser = sessionStorage.getItem("tokenUser");
		if (tokenPW === null) {
			history.push("/");
		} else {
			tokenPW = password;
			tokenUser = username;
		}
		// Update session storage
		sessionStorage.setItem("tokenPW", tokenPW);
		sessionStorage.setItem("tokenUser", tokenUser);
	}

  useEffect(() =>{
		handleDate();
		handleRefresh();
		// eslint-disable-next-line
	},[])

function login () {
		setLoading(true)
		axios.post(`${process.env.REACT_APP_LOGIN_URL}`, {
			username: username,
			password: password,
			lastLogin: lastLogin,
		})
		.then(function(response){
			setUser(username);
			setLoggedIn(true);
			setLoading(false);
			handleTokens();
			if (response.data === "LOGGED IN"){
				axios.post(`${process.env.REACT_APP_SET_ROLE_URL}`, {
					username: username, 
					password: password,
				})
				.then((response) => {
					setRole(response.data.role);
				})
			} else {
				alert("Wrong Username or Password")
			}
		})
		.catch(function (error) {
			alert("Wrong Username or Password")
			setLoading(false);
		});
	}

	

	const logout = () => {
		localStorage.clear();
		sessionStorage.clear();
		window.location.reload();
		setLoggedIn(false);
		setUser("");
		setPassword('');
		setUsername("");
	}

	function confirmAdmin () {
		axios.post(`${process.env.REACT_APP_ADMIN_CONFIRM_URL}`, {
			role: role,
		})
		.then(function(response){
			if (response.data !== "Role Confirmed"){
				alert("You do not have this permission!");
				localStorage.clear();
				sessionStorage.clear();
				window.location.reload();
				setLoggedIn(false);
				history.push("/LoginPage");
			} 
		})
	}

	function confirmRole () {
		axios.post(`${process.env.REACT_APP_ROLE_CONFIRM_URL}`, {
			role: role,
		})
		.then(function(response){
			if (response.data !== "Role Confirmed" ){
				alert("Role was not confirmed");
				localStorage.clear();
				sessionStorage.clear();
				window.location.reload();
				setLoggedIn(false);
				history.push("/");
			}
		})
	}

	function handleRefresh() {
		setLoggedIn(true)
		let tokenPW = sessionStorage.getItem("tokenPW");
		let tokenUser = sessionStorage.getItem("tokenUser");
		if (tokenPW === null && tokenUser === null) {
			history.push("/");
			setLoggedIn(false);
		} else {
			axios.post(`${process.env.REACT_APP_LOGIN_URL}`, {
			username: tokenUser,
			password: tokenPW,
		})
		.then(function(response){
			let tokenPW = sessionStorage.getItem("tokenPW");
			let tokenUser = sessionStorage.getItem("tokenUser");
			setUser(tokenUser)
			if (response.data === "LOGGED IN"){
				axios.post(`${process.env.REACT_APP_SET_ROLE_URL}`, {
					username: tokenUser, 
					password: tokenPW,
				})
				.then((response) => {
					setRole(response.data)
					setLoggedIn(true);
				})
			}
		})
		.catch(function (error) {
		throw error;
		});
	}}

  return (
    <div className="App">
      <GlobalStyles />

        <Nav
			logout={logout}
			isLoggedIn={isLoggedIn}
			user={user}
			role={role}
			confirmAdmin={confirmAdmin}
        />

        <Switch>
          <Route path={'/'} exact>
            <HomePage
				user={user}
			/>
          </Route> 
          
          <Route path="/AboutPage" exact>
            <AboutPage />
          </Route>
          
          <Route path="/ContactPage" exact>
            <ContactPage />
          </Route>

          <Route path="/CreatePostPage" exact>
            <CreatePostPage
				user={user}
				role={role}
			/>
          </Route>

          <Route path="/EditPostPage/:postId" exact>
            <EditPostPage />
          </Route>

          <Route path="/CreateUser" exact>
            <CreateUser
              confirmRole={confirmRole}
            />
          </Route>

          <Route path="/SignUpPage" exact>
            <SignUpPage />
          </Route>

          <Route path="/LoginPage" exact>
            <LoginPage
              login={login}
              setUsername={setUsername}
              setPassword={setPassword}
              handleTokens={handleTokens}
              isLoading={isLoading}
            />
          </Route>

          <Route path="/ProfilePage" exact>
            <ProfilePage
				user={user}
				role={role}
			/>
          </Route>

          <Route path={["/post/:linkTitle/:id", "/"]}>
            <ArticlePage
				user={user}
				role={role}
				isLoggedIn={isLoggedIn}
			/>
          </Route>
        </Switch>

      <Footer />
    </div>
  );
}

export default App;
