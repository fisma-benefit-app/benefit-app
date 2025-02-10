import './index.css'
import { ReactNode } from 'react';
export default function Layout({children}: {children: ReactNode}) {
    return (
      <div className="relative min-h-screen">
        
        {/* Header */}
        <header className="fixed top-0 left-0 w-full bg-sky-600 text-white shadow-md flex items-stretch">
          {/* FISMA Logo on the upper left*/}
          <img src="/Fisma_logo.png" alt="FISMA Logo" className="h-15 w-auto mb-2 ml-2"/>
          <h1 className="text-lg flex items-end pb-1.5">Toimintopistelaskuri</h1>
          <div className='absolute top-0 right-0 h-full flex items-center'>
          <button className='h-full text-lg px-10 hover:bg-zinc-600 flex items-center'>Kirjaudu sisään/ulos</button>
          <button className='h-full text-lg px-10 hover:bg-zinc-600 flex items-center'>Projektit</button>
          <button className='h-full text-lg px-10 hover:bg-zinc-600 flex items-center'>TP-laskuri</button>
          </div>
        </header>
  
        {/* Page Content */}
        <main className="pt-20 pb-20 max-w-5xl mx-auto text-center ">
        {children}
        </main>
  
        {/* Footer */}
        <footer className="fixed bottom-0 left-0 w-full bg-sky-600 text-white py-4 shadow-md flex justify-center items-center">
          <p>Footer</p>
        </footer>
      </div>
    );
  }
  