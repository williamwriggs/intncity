import * as React from 'react';
import { Navigate, Routes, Route } from "react-router-dom";

import Requests from './Requests';
import Request from './Request';
import Distribution from './Distribution';

export default function Admin() {
  return (
    <Routes>
			<Route path="/" element={<Navigate replace to="./requests" />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/requests/:requestId" element={<Request />} />
      <Route path="/distributions/:distributionId" element={<Distribution />} />
      <Route path="/*" element={<>Can't find that page (404)</>} />
    </Routes>
  );
};
