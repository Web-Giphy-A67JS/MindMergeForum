import { BrowserRouter, Route, Routes} from "react-router-dom";
import { ChakraProvider, Container } from "@chakra-ui/react";
import Home from "./pages/Home/Home";
import Forum from "./pages/Forum/Forum";
import CreatePost from "./pages/CreatePost/CreatePost";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Authenticated from "../hoc/Authenticated";
import { AppContext } from './store/app.context';
import Header from '../components/Header/Header';
import { useState, useEffect } from "react";
import { auth } from './config/firebase.config';
import { getUserData } from '../services/user.services';
import NotFound from '../components/NotFound/NotFound';
import { useAuthState } from 'react-firebase-hooks/auth';
import Profile from '../components/Profile/Profile';
import Post from '../components/Post/Post';
import BannedUser from "../components/BannedUser/BannedUser";
import AdminTools from "./pages/AdminTools/AdminTools";

function App() {

  const [appState, setAppState] = useState({
    user: null,
    userData: null
  }) //here we use useState because it sets the global state. Other components will use useContext to access it

  const [user] = useAuthState(auth);

  if(appState.user !== user){
    setAppState({
      ...appState,
      user,
    })
  }

  useEffect(()=>{
    if(!user){
      return;
    }
    getUserData(appState.user?.uid)
    .then((data)=>{
      const userData = data[Object.keys(data)[0]];
      setAppState({
        ...appState,
        userData,
      })
    })
  }, [user])

  return (
    <ChakraProvider>
      <BrowserRouter>
        <AppContext.Provider value = {{...appState, setAppState}}>
          <Header />
          <Container maxW="container.xl" py={4}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/create-post" element={<Authenticated><CreatePost /></Authenticated>} />
              <Route path="/posts/:id" element={<Authenticated><Post /></Authenticated>} />
              <Route path="/user-profile" element={<Authenticated><Profile /></Authenticated>} />
              <Route path="/admin-tools" element={<Authenticated><AdminTools /></Authenticated>} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/banned" element={<Authenticated><BannedUser /></Authenticated>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Container>
          <Container maxW="container.xl" py={4}>
            <footer>&copy;2025</footer>
          </Container>
        </AppContext.Provider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
