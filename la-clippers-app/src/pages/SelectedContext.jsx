import React, { createContext, useState } from 'react';

const SelectedContext = createContext();

export const SelectedProvider = ({ children }) => {
    const [selectedFolder, setSelectedFolder] = useState('');
    const [selectedFile, setSelectedFile] = useState('');
    const [tableData, setTableData] = useState([]);
    const [boxScoreTableData, setBoxScoreTableData] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [Filter, setFilter] = useState([]);
    const [selected_quarter, setSelectedQuarter] = useState('')
    const [pbp_quarters, setPBPQuarters] = useState('')
    const [boxscore, setBoxScore] = useState('')
    const [visitor_team, setVisitorTeam] = useState('')
    const [home_team, setHomeTeam] = useState('')


    const value = {
        selectedFolder,
        setSelectedFolder,
        selectedFile,
        setSelectedFile,
        tableData,
        setTableData,
        boxScoreTableData,
        setBoxScoreTableData,
        fileList, 
        setFileList,
        Filter, 
        setFilter,
        selected_quarter, 
        setSelectedQuarter,
        boxscore, 
        setBoxScore,
        pbp_quarters, 
        setPBPQuarters,
        home_team, 
        setHomeTeam, 
        visitor_team, 
        setVisitorTeam,        

    };

    return (
        <SelectedContext.Provider value={value}>
            {children}
        </SelectedContext.Provider>
    );
}

export default SelectedContext;