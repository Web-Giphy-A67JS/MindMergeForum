import { useContext } from 'react';
import { AppContext } from '../../src/store/app.context';

export default function Profile() {
  const { userData } = useContext(AppContext);

  return (
    <div>
      <h2>Profile</h2>
      <p>First Name: {userData.firstName}</p>
      <p>Last Name: {userData.lastName}</p>
    </div>
  );
}