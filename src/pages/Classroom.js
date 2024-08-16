import React from 'react';
import { Route, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Students from './Students';
import Analytics from './Analytics';

const ClassroomPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>Classroom {id}</h2>
      <Navbar classroomId={id} />
        <Route path="/classroom/:id/students" component={Students} />
        <Route path="/classroom/:id/analytics" component={Analytics} />
    </div>
  );
};

export default ClassroomPage;
