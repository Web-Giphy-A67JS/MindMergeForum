import { useState, useEffect } from "react";
import { getAllUsers, getAllUsersByEmail, updateUserRole } from "../../../services/user.services";
import { useSearchParams } from "react-router-dom";
import { Roles } from "../../../common/roles.enum";

export default function AdminTools() {
  const [users, setUsers] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const searchMethod = searchParams.get('method') || 'username';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let data;
        if (search === '') {
          data = await getAllUsers();
        } else if (searchMethod === 'email') {
          data = await getAllUsersByEmail(search);
        } else {
          data = await getAllUsers(search);
        }
        setUsers(data);
      } catch (error) {
        alert(error.message);
      }
    };

    fetchUsers();
  }, [search, searchMethod]);

  const handleBan = async (uid) => {
    try {
      const user = users.find((u) => u.uid === uid);
      const newRole = user.role === Roles.banned ? Roles.user : Roles.banned;
      await updateUserRole(uid, newRole);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
    <br />
      <h2>Welcome to your admin tools!</h2>
      <br /><br />
      <label>Search by: </label>
      <label>
        <input
          type="radio"
          name="method"
          value="username"
          checked={searchMethod === 'username'}
          onChange={(e) => setSearchParams({ method: e.target.value, search })}
        />
        Username
      </label>
      <label>
        <input
          type="radio"
          name="method"
          value="email"
          checked={searchMethod === 'email'}
          onChange={(e) => setSearchParams({ method: e.target.value, search })}
        />
        Email
      </label>
      <input
        type="text"
        name="search"
        id="search"
        value={search}
        onChange={(e) => setSearchParams({ method: searchMethod, search: e.target.value })}
        style={{ marginLeft: "10px" }}
      />
      <br /><br />
      {users.length > 0 ? (
        users.map((u) => (
          <div key={u.uid} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>username: {u.handle}{<br />}email: {u.email}</span>
            <button onClick ={()=>handleBan(u.uid)}>{u.role === 'banned' ? 'Unban':'Ban'}</button>
          </div>
        ))
      ) : (
        <p>No Users found with this {searchMethod}</p>
      )}
    </>
  );
}