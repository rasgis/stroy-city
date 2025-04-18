import React from "react";
import { Routes, Route } from "react-router-dom";
import UserList from "./UserList";
import UserCreate from "./UserCreate";
import UserEdit from "./UserEdit";

const Users = () => {
  return (
    <Routes>
      <Route path="/" element={<UserList />} />
      <Route path="/create" element={<UserCreate />} />
      <Route path="/edit/:id" element={<UserEdit />} />
    </Routes>
  );
};

export default Users;
