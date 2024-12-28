import { useLocation } from 'react-router-dom';
import React, { useEffect, useState, useMemo, useContext } from "react";
import axios from 'axios'
import SelectedContext from './SelectedContext';

export default function TitleBar() {
  const location = useLocation();
  const [folderList, setFolderList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const { selectedFolder, setSelectedFolder, selectedFile, setSelectedFile, fileList } = useContext(SelectedContext);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const handleFolderSelection = (e) => {
    console.log('Title Bar: Selected Folder', e.target.value)
    setSelectedFolder(e.target.value);
    console.log('from TB:', fileList)
    setSelectedFile('--Select a file--');
    setTableData([])
  };


  function getPageTitle(pathname) {
    switch (pathname) {
      case '/schedule':
        return 'Schedule';
      case '/gamePBP':
        return 'Game PBP';
      case '/':
      default:
        return '';
    }
  }


  const getRightSideContent = (pathname) => {
    if (pathname === '/gamePBP') {
        return (
<div className="flex items-center">
    <label className='pr-4 text-sm font-medium text-clippersWhite'>Select Folder:</label>
    <div className="relative">
        <select
            value={selectedFolder}
            onChange={handleFolderSelection}
            className="appearance-none border-2 border-clippersWhite
            rounded-md bg-clippersBlack text-clippersWhite pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-clippersBlue focus:border-transparent"
        >
            <option value="">--Select a folder--</option>
            {folderList.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
            ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4 text-clippersWhite" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z" />
            </svg>
        </div>
    </div>
</div>
        );
    } else if (pathname === '/') {
      return  <div className="text-xl font-bold">{currentTime}</div>

    } else 
    return null;
};

  const fetchInitial_Folders = () => {
    axios.get("http://localhost:8000/initial_folders/", {
  
    }).then(response => {
  
      setFolderList(response.data['data'].initial_folders)

      console.log(folderList)
      
    });}
    

  
  
  useEffect(() => {
    fetchInitial_Folders();
    const timerId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));
    }, 1000);
    return () => clearInterval(timerId);
  
   
  }, []);



  const pageTitle = getPageTitle(location.pathname);
  const pageRight = getRightSideContent(location.pathname);


  return (
    <div className='pl-20 pr-20 bg-clippersBlack w-full'>
      <header className="grid grid-cols-3 grid-template-columns: auto 1fr auto items-center justify-center px-4 py-4 w-full bg-clippersBlack text-clippersWhite">

        {/* Left section */} {/* Left Empty Space */}
        <div className="col-span-1 flex justify-left items-center h-11">
          <img src="https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg" alt="Clippers Logo" 
          // className="max-h-12 pr-4 w-auto" />
          className={`max-h-12 pr-4 w-auto ${(location.pathname === '/') ? 'opacity-0' : 'opacity-100'}`}/>
          <h1 className="text-xl font-bold max-h-11">{pageTitle}</h1>  
        </div> 



        {/* Middle Section */}
        <div className="col-span-1 flex justify-center items-center">
        {pageRight}

        </div>

        {/* Right section */}
        {/* {pageRight} */}
        <div className="col-span-1 flex justify-end">
        {location.pathname !== '/' && <div className='flex justify-center'> {currentTime} </div>}          
        </div>

      </header>

      <div className=' items-center border border-black border-b-clippersRed'></div>

    </div>

  );
}