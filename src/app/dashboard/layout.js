import React from 'react';
import Header from '@/components/Header';

const DashboardLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className='mt-20'>
        {children}
      </main>
    </>
  );
};

export default DashboardLayout;