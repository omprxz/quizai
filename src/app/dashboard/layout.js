import React from 'react';
import Header from '@/components/Header';

const DashboardLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className='mt-16'>
        {children}
      </main>
    </>
  );
};

export default DashboardLayout;