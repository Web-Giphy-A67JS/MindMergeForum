import { BrowserRouter, Route, Routes} from "react-router-dom";
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import './App.css';
import BannedUser from "../components/BannedUser/BannedUser";
import AdminTools from "./pages/AdminTools/AdminTools";
import PasswordChange from '../components/PasswordChange/PasswordChange'

// Stack Overflow inspired theme
const queryClient = new QueryClient();

const theme = extendTheme({
  colors: {
    brand: {
      primary: '#F48024', // Stack Overflow orange as primary
      accent: '#E67420',  // Darker orange for accent
      gray: {
        50: '#F8F9F9',
        100: '#EFF0F1',
        200: '#E4E6E8',
        300: '#D6D9DC',
        400: '#BBC0C4',
        500: '#9199A1',
        600: '#6A737C',
        700: '#3C4146',
        800: '#242729',
        900: '#0C0D0E',
      }
    },
    orange: {
      50: '#FFF3E0',
      100: '#FFE0B2',
      200: '#FFCC80',
      300: '#FFB74D',
      400: '#FFA726',
      500: '#F48024', // Stack Overflow orange
      600: '#E67420',
      700: '#D66010',
      800: '#C65000',
      900: '#B54000',
    }
  },
  fonts: {
    body: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    heading: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  }
});

function App() {
  const [appState, setAppState] = useState({
    user: null,
    userData: null
  })

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
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContext.Provider value = {{...appState, setAppState}}>
          <Header></Header>
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
            <Route path="/password-change" element={<Authenticated><PasswordChange /></Authenticated>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AppContext.Provider>
        </BrowserRouter>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
