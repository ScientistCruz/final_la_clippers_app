import React, { useEffect, useState, useMemo, useContext } from "react";
import SelectedContext from './SelectedContext';
import axios from 'axios'
import { useTable, useSortBy, usePagination, useFilters, useGlobalFilter } from 'react-table';

// This file includes code for all associated pages to the /gamepbp site.
// Functions: 
//    Parent - GamePBP
//       Children - Boxscore (Children - StatsTable)
//                - TeamStatsTable
//                - PlayByPlaytable


function GamePBP() {
    const [activeTab, setActiveTab] = useState('Boxscore');
    const [pageState, setPageState] = useState(''); 
    const [game_info, setGameInfo] = useState('');
    const [homelogoURL, setHomelogoURL] = useState('');
    const [awaylogoURL, setAwaylogoURL] = useState('');
    const [team_stats, setTeamStats] = useState('')
    const [pbp, setPBP] = useState('')

    const { selectedFolder, selectedFile, home_team, setHomeTeam, visitor_team, setVisitorTeam,
      tableData, setTableData, boxscore, setBoxScore, boxScoreTableData, setBoxScoreTableData, fileList, setFileList, Filter, setFilter, 
      selected_quarter, setSelectedQuarter , pbp_quarters, setPBPQuarters} = useContext(SelectedContext);


    const fetchDataForFiles = async (fileNames) => {
      try {
          const fetchPromises = fileNames.map(fileName =>
              axios.get("http://localhost:8000/get_file/", 
              {headers: { folder: selectedFolder, file : fileName}}
              ).then(response => response.data.data)
          );

          // Wait for all axios requests to complete
          const results = await Promise.all(fetchPromises);

          // Construct an object with file names as keys and fetched data as values
          const dataMap = fileNames.reduce((acc, fileName, index) => {
              acc[fileName] = results[index];
              return acc;
          }, {});

          setPBP(dataMap);

        } catch (error) {
          console.error('Failed to fetch data:', error);
      }
  };




    const fetchFolder_files = async (selectedFolder) => {

      if ((selectedFolder != null) && (selectedFolder != '')) {


      const response = await axios.get("http://localhost:8000/folder_files/", {
        headers: { folder: selectedFolder }
      });      

      const files = response.data.data.files;
      const box_scorefile = files.filter(str => str.includes('boxscore'));
      const game_infofile = files.filter(str => str.includes('game_info'));
      const pbp_infofile = files.filter(str => str.includes('pbp'));

      const quarters = pbp_infofile.map(filename => {
        const match = filename.match(/Q\d+/);
        return match ? match[0] : null;
      }).sort((a, b) => {
        // Compare numeric parts: e.g. Q3 => 3
        const numA = parseInt(a.slice(1), 10);
        const numB = parseInt(b.slice(1), 10);
        return numA - numB;
      });
      

      setPBPQuarters(quarters)
      setSelectedQuarter(quarters[0])

      const box_scorefile_response = await axios.get("http://localhost:8000/get_file/", {
        headers: { folder: selectedFolder, file : box_scorefile[0]}
      });         

      const game_infofile_response = await axios.get("http://localhost:8000/get_file/", {
        headers: { folder: selectedFolder, file : game_infofile[0]}
      });         

      const pbp_infofile_response = await axios.get("http://localhost:8000/get_file/", {
        headers: { folder: selectedFolder, file : pbp_infofile[0]}
      });


      fetchDataForFiles(pbp_infofile)



      const boxscore = box_scorefile_response.data.data.period_time;


      setFileList(files)

      setVisitorTeam(game_infofile_response.data.data.visitor_team)
      setHomeTeam(game_infofile_response.data.data.home_team)
      setGameInfo(game_infofile_response.data.data.game_info)
      setTeamStats(box_scorefile_response.data.data.team_stats)
      setPBP(pbp_infofile_response.data.data.event_pbp)
      setBoxScore(box_scorefile_response.data.data)
      setBoxScoreTableData(box_scorefile_response.data.data.player_stats)

      // Down the line this could have a better implementation with a library for the different team logos available
      if (game_infofile_response.data.data.home_team.Team_name[0] === 'Stars') {
        setHomelogoURL("https://ak-static.cms.nba.com/wp-content/uploads/logos/nbagleague/1612709903/primary/D/logo.svg" )
      } else {
      }  

      if (game_infofile_response.data.data.visitor_team.Team_name[0] === 'Clippers') {
        setAwaylogoURL("https://ak-static.cms.nba.com/wp-content/uploads/logos/nbagleague/1612709924/primary/D/logo.svg"  )
      } else {
      }        


    }
    } 


    useEffect(() => {
        fetchFolder_files(selectedFolder)

      }, [selectedFolder, selectedFile]);


    return (
        <div>
          {selectedFolder &&         
          <div className="flex flex-col h-full bg-clippersBlue">
              {/* Top Container for Game Boxscore */}
              <div className="bg-clippersBlack top-0 bottom-0 right-0 left-0 text-clippersWhite p-4 grid grid-cols-3 grid-rows-1">
                  {/* Home Team Info */}
                  <div className="flex flex-col items-center justify-center">
                      <img src={homelogoURL} alt="Home Team" className="h-10 w-10 mr-2 items-center"/>
                      <div className="flex flex-col items-center justify-center">
                        {home_team.Team_city && (<p className="items-center justify-center">{home_team.Team_city[0]} {home_team.Team_name[0]}</p>)}
                        <p className="items-center justify-center">{boxscore.home_team_score && boxscore.home_team_score[0].Home_score}</p>
                      </div>                  
                  </div>
              
                  <div className="col-span-1">
                      <p className="flex flex-col items-center justify-center">{boxscore.game_info && boxscore.game_info[0].Game_date}</p>
                      <p className="flex flex-col items-center justify-center">{boxscore.game_info && boxscore.game_info[0].Game_time}</p>
                      <p className="flex flex-col items-center justify-center">{boxscore.game_info && boxscore.game_info[0].Arena_name}</p>
                  </div>
                  {/* Visitor Team Info */}
                  <div className="flex flex-col items-center justify-center">
                  <img src={awaylogoURL} alt="Away Team" className="h-10 w-10 mr-2"/>
                      <div className="flex flex-col items-center justify-center">
                        {visitor_team.Team_city && (<p>{visitor_team.Team_city[0]} {visitor_team.Team_name[0]}</p>)}
                        <p>{boxscore.visitor_team_score && boxscore.visitor_team_score[0].Visitor_score}</p>
                      </div>
                  </div>
              </div>

              {/* Bottom Container for Detailed Stats and Play-By-Play */}
              <div className="bg-clippersBlue h-full">
                  {/* Navbar for selecting data display */}
                  <nav className="flex w-full items-center bg-clippersBlack">
                    <div className="flex justify-center w-full">
                        {['Boxscore', 'Team Stats', 'Play By Play'].map((item) => (
                            <button
                                key={item}
                                onClick={() => setActiveTab(item)}
                                className={`mx-2 px-4 py-2 text-sm font-medium ${activeTab === item ? 'text-clippersWhite border-b-4 border-clippersRed' : 'text-clippersSilver hover:text-clippersWhite'}`}
                                style={{ transition: 'all 0.3s ease-in-out' }}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                  </nav>

                  {/* Content area for selected tab */}
                  <div className="p-4 bg-clippersBlue h-full min-h-[1600px] overflow-y-scroll">
                      {activeTab === 'Boxscore' && <Boxscore visitor_team={visitor_team} home_team={home_team} />}
                      {activeTab === 'Team Stats' && <TeamStatsTable homeTeam={team_stats[0]} visitor_team={team_stats[1]} />}
                      {activeTab === 'Play By Play' && <PlayByPlayTable data_input={pbp} pbp_quarters={pbp_quarters}/>}
                  </div>
              </div>
          </div>}
        </div>
    );
}


function Boxscore({visitor_team, home_team}) {
  const { boxScoreTableData, Filter, setFilter} = useContext(SelectedContext);
  const [ isHomeTeam, setisHomeTeam] = useState(false);

  const handleToggle = () => {
    if (isHomeTeam === true) {
      setFilter(home_team.Team_abr[0])
    } else {
      setFilter(visitor_team.Team_abr[0])
    }
    setisHomeTeam(prev => !prev);
  };
    


  return <div className="grid grid-cols-1 grid-rows-2">
          <div className="row-span-1">
            <StatsTable  data={boxScoreTableData} Filter={Filter} className/>
          </div>

          <div className="row-span-1 p-5">
            <div className="flex justify-center items-center space-x-2">
              {/* OFF Label */}
              <span className={`font-medium ${!isHomeTeam ? 'text-clippersWhite' : 'text-clippersGray'}`}>
              
              {visitor_team.Team_name && (<p>{home_team.Team_city[0]} {home_team.Team_name[0]}</p>)}
                
              </span>

              {/* Toggle Container */}
              <div onClick={handleToggle} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${isHomeTeam ? 'bg-clippersRed' : 'bg-clippersSilver'}`}>
                {/* Toggle Circle */}
                <div className={`bg-clippersWhite w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isHomeTeam ? 'translate-x-6' : 'translate-x-0'}`}/>

              </div>

              {/* ON Label */}
              <span className={`font-medium ${isHomeTeam ? 'text-clippersWhite' : 'text-clippersGray'}`}>

              {visitor_team.Team_name && (<p>{visitor_team.Team_city[0]} {visitor_team.Team_name[0]}</p>)}
                
              </span>
            </div>

          </div>

        </div>
}

const TeamStatsTable = ({ homeTeam, visitor_team }) => {
  const { boxscore, pbp_quarters} = useContext(SelectedContext);

  const statsToShow = [
      { label: 'FG', key: 'FG_made', attemptKey: 'FG_attempted' },
      { label: 'Field Goal %', key: 'FG_made', attemptKey: 'FG_attempted', percentage: true },
      { label: '3PT', key: 'Three_made', attemptKey: 'Three_attempted' },
      { label: 'Three Point %', key: 'Three_made', attemptKey: 'Three_attempted', percentage: true },
      { label: 'FT', key: 'FT_made', attemptKey: 'FT_attempted' },
      { label: 'Free Throw %', key: 'FT_made', attemptKey: 'FT_attempted', percentage: true },
      { label: 'Rebounds', key: 'Offensive_rebounds', subKey: 'Defensive_rebounds', totalKey: 'Team_rebounds' },
      { label: 'Assists', key: 'Assists' },
      { label: 'Steals', key: 'Steals' },
      { label: 'Blocks', key: 'Blocks' },
      { label: 'Total Turnovers', key: 'Turnovers' },
      { label: 'Points', key: 'Points' },
      { label: 'Fouls', key: 'Fouls' },
      { label: 'Largest Lead', key: 'Biggest_lead' }
  ];


  const formatStat = (team, key, attemptKey, percentage = false) => {
      const value = team[key];
      const attempt = team[attemptKey];
      if (percentage) {
          if (value && attempt) {
              return `${((value / attempt) * 100).toFixed(1)}%`;
          }
          return '0%';
      }
      return `${value}${attempt ? `-${attempt}` : ''}`;
  };

  const test = (data, quarter) => {

      const quartersToShow = [
          {label: '1st Quarter', key: 'Q1', boxscore_key: 'Qtr_1'},
          {label: '2nd Quarter', key: 'Q2', boxscore_key: 'Qtr_2'},
          {label: '3rd Quarter', key: 'Q3', boxscore_key: 'Qtr_3'},
          {label: '4th Quarter', key: 'Q4', boxscore_key: 'Qtr_4'},
          {label: '4th Quarter', key: 'Q5', boxscore_key: 'Qtr_5'},
          {label: 'OT - 1', key: 'Q6', boxscore_key: 'Qtr_6'},
          {label: 'OT - 2', key: 'Q7', boxscore_key: 'Qtr_7'},
          {label: 'OT - 3', key: 'Q8', boxscore_key: 'Qtr_8'},
          {label: 'OT - 4', key: 'Q9', boxscore_key: 'Qtr_9'},
          {label: 'OT - 5', key: '10', boxscore_key: 'Qtr_10'},
  
      ]

      quartersToShow.find(row => row['key'] === quarter)

      return data[quartersToShow.find(row => row['key'] === quarter)['boxscore_key'].concat( '_score')]
  };


  console.log(boxscore.home_team_score[0].Team_city)

  return (
      <div className='w-full max-w-7xl min-h-full mx-auto p-2 flex justify-center '>
      <table className="divide-y divide-gray-200 text-sm justify-center overflow-x-auto h-full">
          <thead className='bg-clippersGray'>
              <tr className="">
                  <th className="px-2 py-1 text-center font-medium text-clippersBlack uppercase tracking-wider select-none text-xs ">Stat</th>
                  <th className="px-2 py-1 text-center font-medium text-clippersBlack uppercase tracking-wider select-none text-xs">{homeTeam.Team_name}</th>
                  <th className="px-2 py-1 text-center font-medium text-clippersBlack uppercase tracking-wider select-none text-xs">{visitor_team.Team_name}</th>
              </tr>
          </thead>
          <tbody className='bg-clippersWhite divide-y divide-gray-100 overflow-scroll'>
              {statsToShow.map(stat => (
                  <tr className="hover:bg-clippersSilver" key={stat.label}>
                      <td className="px-2 py-1 bg-clippersGray text-clippersBlack text-xs overflow-hidden text-center text-ellipsis whitespace-nowrap">{stat.label}</td>
                      <td className="px-2 py-1 text-clippersBlack text-xs overflow-hidden text-center text-ellipsis whitespace-nowrap">{stat.percentage ? formatStat(homeTeam, stat.key, stat.attemptKey, true) : formatStat(homeTeam, stat.key, stat.attemptKey)}</td>
                      <td className="px-2 py-1 text-clippersBlack text-xs overflow-hidden text-center text-ellipsis whitespace-nowrap">{stat.percentage ? formatStat(visitor_team, stat.key, stat.attemptKey, true) : formatStat(visitor_team, stat.key, stat.attemptKey)}</td>
                  </tr>
              ))}
          </tbody>


      </table>

      <div className='m-2'>

      </div>

      <table className=" divide-gray-200 text-sm justify-center max-h-11">
          <thead className='bg-clippersGray'>
              <tr className="">
                  <th className="px-3 py-2 text-center font-medium text-clippersBlack uppercase tracking-wider select-none text-xs "></th>
                  {pbp_quarters.map(period => (
                  <th className="px-3 py-2 text-center font-medium text-clippersBlack uppercase tracking-wider select-none text-xs">{period}</th>
                  ))}                    
                
              </tr>
          </thead>


          <tbody className='bg-clippersWhite divide-y divide-gray-100 overflow-scroll'>
              <tr className="hover:bg-clippersSilver" >
                  <td className="px-3 py-2 bg-clippersGray text-clippersBlack text-xs overflow-hidden text-center text-ellipsis whitespace-nowrap">{boxscore && boxscore.home_team_score[0].Team_name}</td>

                  {pbp_quarters.map(period => (
                      <td className="px-3 py-2 text-clippersBlack text-xs overflow-hidden text-center text-ellipsis whitespace-nowrap">{boxscore && test(boxscore.home_team_score[0], period)}</td>
                          
                  ))}

              </tr>
              <tr className="hover:bg-clippersSilver" >
                  <td className="px-3 py-2 bg-clippersGray text-clippersBlack text-xs overflow-hidden text-center text-ellipsis whitespace-nowrap">{boxscore && boxscore.visitor_team_score[0].Team_name}</td>

                  {pbp_quarters.map(period => (
                      <td className="px-3 py-2 text-clippersBlack text-xs overflow-hidden text-center text-ellipsis whitespace-nowrap">{boxscore && test(boxscore.visitor_team_score[0], period)}</td>
                          
                  ))}
                  
              </tr>                
          </tbody>

      </table>

      </div>

  );
};

const PlayByPlayTable = ({data_input, pbp_quarters}) => {
  const [data, setData] = useState([]);
  const { selected_quarter, setSelectedQuarter, home_team, visitor_team } = useContext(SelectedContext);

  const handleQuarterChange = (period) => {
      const foundKey = Object.keys(data_input).find(key => key.includes(period));
      setSelectedQuarter(period);
      setData(data_input[foundKey].event_pbp);
  };



  const columns = useMemo(() => [
    { Header: 'Time', accessor: 'Game_clock' },
    // { Header: 'Play', accessor: 'Description' },
    { Header: 'Event Type', accessor: 'msgType',
      Cell: ({ row }) => {
        const teamName = row.original.Team_abr;  // Accessing other column data

        return teamName === 'SLC' ? (<div className="bg-clippersBlueTransparent text-clippersBlack p-2 rounded"> {msgMap[row.original.Msg_type]} </div>) 
      : (<div className="bg-clippersRed text-clippersWhite p-2 rounded"> {msgMap[row.original.Msg_type]} </div>);}},
    { Header: 'Action Type', accessor: 'Action_type' },
    { Header: 'Points', accessor: 'Pts',  },
    { Header: home_team.Team_name[0], accessor: 'Home_score', Cell: ({ row }) => {
      const teamName = row.original.Team_abr;  // Accessing other column data

    return teamName === 'SLC' ? (<div className="bg-clippersBlueTransparent text-clippersBlack p-2 rounded"> {row.original.Home_score} </div>) 
    : (<div className="text-clippersBlack p-2 rounded"> {row.original.Home_score} </div>);} },
    { Header: visitor_team.Team_name[0], accessor: 'Visitor_score', Cell: ({ row }) => {
      const teamName = row.original.Team_abr; 

    return teamName === 'SLC' ? (<div className="text-clippersBlack p-2 rounded"> {row.original.Home_score} </div>) 
    : (<div className="bg-clippersRed text-clippersWhite p-2 rounded"> {row.original.Home_score} </div>);}  },

  ], []);  

  const msgMap = {
    1:  "Made Shot",
    2:  "Missed Shot",
    3:  "Free Throw",
    4:  "Rebound",
    5:  "Turnover",
    6:  "Foul",
    7:  "Violation",
    8:  "Substitution",
    9:  "Timeout",
    10: "Jump Ball",
    11: "Ejection",
    12: "Start Period",
    13: "End Period",
    14: "Validation",
    15: "Ejection",        // twice in list
    16: "Final Box Printed",
    18: "Instant Replay",
    20: "Stoppage"
  };

  
  const {getTableProps, getTableBodyProps, headerGroups, prepareRow, page, state: { pageIndex },} = 
  useTable({ columns, data, initialState: { pageIndex: 0, pageSize:200 } }, useFilters, useGlobalFilter,usePagination);

  useEffect(() => {
    const foundKey = Object.keys(data_input).find(key => key.includes(selected_quarter));
    setData(data_input[foundKey].event_pbp)
  }, []);


  return (
    <div className='w-full max-w-7xl mx-auto'>
            
            <div className="flex justify-center space-x-4 p-4 ">
                {/* Dynamically generate period buttons */}
                {pbp_quarters.map(period => (
                    <button key={period}
                        className={`mx-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ease-in-out
                        ${selected_quarter === period ?  "bg-clippersBlack text-clippersWhite hover:bg-clippersBlue hover:text-clippersWhite border border-clippersWhite" : "bg-clippersBlue text-clippersWhite border border-clippersBlue"}
                        focus:outline-none focus:ring-2 focus:ring-clippersBlue focus:border-transparent`}
                              
                        onClick={() => handleQuarterChange(period)}>
                        {period}
                    </button>
                ))}
            </div>


      {/* --- Table --- */}
      <div className="flex justify-center overflow-y-auto rounded-lg  border-clippersSilver pt-1 max-h-[350px] w-full">
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200 text-sm overflow-y-scroll">
          <thead className="bg-clippersGray">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column) => (
                  <th key={column.id} className="px-2 py-2 text-left font-medium text-clippersBlack uppercase tracking-tighter select-none text-xs">
                    <div className="inline-flex items-center">
                      {column.render("Header")}
                      {/* Sort Indicator */}
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <svg className="ml-1 w-3 h-3 fill-current text-clippersBlue" viewBox="0 0 320 512">
                            <path d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.1 15.1 4.4 41-16.9 41z" />
                          </svg>
                        ) : (
                          <svg className="ml-1 w-3 h-3 fill-current text-clippersBlue" viewBox="0 0 320 512">
                            <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24.1 329c-15.1-15.1-4.4-41 16.9-41z" />
                          </svg>
                        )
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
              
            ))}
          </thead>

            <tbody {...getTableBodyProps()} className="bg-clippersWhite divide-y divide-gray-200 max-h-[300px] overflow-y-scroll">
                {page.map((row, i) => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => (
                                <td {...cell.getCellProps()} className="px-1 py-1 whitespace-nowrap text-sm text-clippersBlack">
                                    {cell.render('Cell')}
                                </td>
                            ))}
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>

    </div>
  );
};

function StatsTable({ data, Filter }) {
  const { boxScoreTableData} = useContext(SelectedContext);


  const columnsToShow = useMemo(() => [
    // { Header: 'Team ID', accessor: 'Team_id' },
    { Header: 'Order', accessor: 'BoxScoreOrder' },
    // { Header: 'City', accessor: 'Team_city' },
    { Header: 'Team', accessor: 'Team_abr' },
    // { Header: 'Team Name', accessor: 'Team_name' },
    // { Header: 'Person ID', accessor: 'Person_id' },
    // { Header: 'First Name', accessor: 'First_name' },
    // { Header: 'Last Name', accessor: 'Last_name' }, 
    {
      Header: 'Player',
      accessor: d => `${d.First_name} ${d.Last_name} - ${d.Jersey_number}`, // Combine names into one column
      Cell: ({ row }) => (
        <div className={`${row.original.OnCrt === '1' ? 'bg-clippersSilver' : ''}`}>
          {row.values['Player']}
        </div>
      )
    },  
    // { Header: 'Number', accessor: 'Jersey_number' },
    { Header: 'POS', accessor: 'Starting_position' },
    { Header: 'STARTER', accessor: 'starter' },
    { Header: 'ONCRT', accessor: 'OnCrt' },
    { Header: 'MINS', accessor: 'Minutes',
    Cell: ({ row }) => `${row.original.Minutes}:${row.original.Seconds}`}, 
    // { Header: 'MINS', accessor: 'Minutes' },
    // { Header: 'SEC', accessor: 'Seconds' },
    { Header: 'PTS', accessor: 'Points' },
    { Header: 'AST', accessor: 'Assists' },
    { Header: 'BLK', accessor: 'Blocks' },
    // { Header: 'Blocks Against', accessor: 'BlocksAgainst' },
    { Header: 'FGM', accessor: 'FG_made' },
    { Header: 'FGA', accessor: 'FG_attempted' },
    { Header: 'PF', accessor: 'Fouls' },
    { Header: 'FTM', accessor: 'FT_made' },
    { Header: 'FTA', accessor: 'FT_attempted' },
    { Header: '+/-', accessor: 'PlusMinus' },
    { Header: 'DREB', accessor: 'Defensive_rebounds' },
    { Header: 'OREB', accessor: 'Offensive_rebounds' },
    { Header: 'STL', accessor: 'Steals' },
    { Header: '3PM', accessor: 'Three_made' },
    { Header: '3PA', accessor: 'Three_attempted' },
    { Header: 'TO', accessor: 'Turnovers' },
    { Header: 'REB', accessor: 'Total_rebounds' },
    { Header: 'TF', accessor: 'TechnicalFouls' },
    { Header: 'FF', accessor: 'FlagrantFouls' }

  ], []);  

  const memoData = useMemo(() => data, [data]);

  // Create the table instance
  const {getTableProps, getTableBodyProps, headerGroups, page, prepareRow, canPreviousPage, canNextPage, pageOptions, pageCount, gotoPage, nextPage, previousPage,
    setPageSize, state: { pageIndex, pageSize, globalFilter }, setGlobalFilter,} = 
    useTable({columns: columnsToShow, data: memoData, initialState: { pageIndex: 0, pageSize: 10, globalFilter: Filter},},
    useFilters,useGlobalFilter, useSortBy, usePagination);

  const handleGlobalFilterChange = (e) => {
    setGlobalFilter(e.target.value || undefined);
  };

  useEffect(() => {
    setGlobalFilter(Filter)

  }, [Filter]);

  return (
<div className="w-full max-w-7xl mx-auto">
      {/* --- Global Filter / Search --- */}
      <div className="flex items-center mb-4 gap-2">
        <label htmlFor="globalSearch" className="font-semibold text-clippersWhite text:xs">
          Search:
        </label>
        <input
          id="globalSearch"
          value={globalFilter || ""}
          onChange={handleGlobalFilterChange}
          placeholder="Type to filter..."
          className="border border-clippersSilver rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200 text-xs"
        />
      </div>


      {/* --- Pagination Controls --- */}
      <div className="flex items-center gap-2 mt-4 text-xs">
        <button
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
          className="px-2 py-0 border bg-clippersWhite rounded disabled:opacity-50"
        >
          {"<<"}
        </button>
        <button
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
          className="px-2 py-0 border bg-clippersWhite rounded disabled:opacity-50"
        >
          {"<"}
        </button>
        <button
          onClick={() => nextPage()}
          disabled={!canNextPage}
          className="px-2 py-0 border bg-clippersWhite rounded disabled:opacity-50"
        >
          {">"}
        </button>
        <button
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
          className="px-2 py-0 border bg-clippersWhite rounded disabled:opacity-50"
        >
          {">>"}
        </button>

        <span className="ml-2 text-clippersWhite text-sm">
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </span>

        {/* Go to page input */}
        <span className="ml-2 text-clippersWhite text-sm">
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            min={1}
            max={pageOptions.length}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            className="w-16 ml-1 border border-clippersSilver rounded text-center text-clippersBlack"
          />
        </span>

        {/* Rows per page */}
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="ml-2 border border-clippersSilver rounded"
        >
          {[5, 10].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>

      {/* --- Table --- */}
      <div className="overflow-x-auto rounded-lg  border-clippersSilver pt-1">
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-clippersGray">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    key={column.id}
                    className="px-3 py-2 text-left font-medium text-clippersBlack uppercase tracking-wider select-none text-xs"
                  >
                    <div className="inline-flex items-center">
                      {column.render("Header")}
                      {/* Sort Indicator */}
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <svg className="ml-1 w-3 h-3 fill-current text-clippersBlue" viewBox="0 0 320 512">
                            <path d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.1 15.1 4.4 41-16.9 41z" />
                          </svg>
                        ) : (
                          <svg className="ml-1 w-3 h-3 fill-current text-clippersBlue" viewBox="0 0 320 512">
                            <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24.1 329c-15.1-15.1-4.4-41 16.9-41z" />
                          </svg>
                        )
                      ) : null}
                    </div>

                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-clippersWhite divide-y divide-clippersGray ">
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={row.id} className="hover:bg-clippersSilver">
                  {row.cells.map((cell) => (
                    
                    <td {...cell.getCellProps()} key={cell.column.id} className="px-3 py-2 text-clippersBlack text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>


    </div>
  );
}


export default GamePBP;