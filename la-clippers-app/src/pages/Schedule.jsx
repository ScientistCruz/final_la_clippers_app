import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Schedule() {
  const [games, setGames] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch games from API
  const fetchGLeague_Schedule = () => {
    axios.get("http://localhost:8000/gleague_schedule/")
      .then(response => {
        setGames(response.data["data"]["game_schedule"]);
      })
      .catch(error => console.error('Error fetching G League schedule:', error));
  };

  // Group games by date
  const gamesByDate = games.reduce((acc, game) => {
    const date = game.Game_date.split('T')[0]; 
    acc[date] = acc[date] || [];
    acc[date].push(game);
    return acc;
  }, {});

  // Get all unique dates sorted
  const uniqueDates = Object.keys(gamesByDate).sort();

  useEffect(() => {
    fetchGLeague_Schedule();
    setSelectedDate(uniqueDates[-1])
    console.log(selectedDate, uniqueDates[-1])
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Scrollable date bar */}
      <div className="flex overflow-x-scroll justify-center bg-clippersBlack py-2 px-4 items-center">
    {uniqueDates.map(date => (
      <button
      key={date}
      onClick={() => setSelectedDate(date)}
      className={`mx-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ease-in-out
                 ${selectedDate === date ? "bg-clippersBlue text-white border border-clippersBlue" : "bg-transparent text-white hover:bg-clippersBlue hover:text-white border border-white"}
                 focus:outline-none focus:ring-2 focus:ring-clippersBlue focus:border-transparent`}
    >
      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    </button>
    ))}
  </div>
      <div className="flex justify-center border-clippersBlue w-full">
        <hr className="border-clippersBlue w-5/12 border-4"/>
      </div>

      {/* Games Section */}
      <div className="w-full max-w-7xl min-h-full mx-auto p-2 flex justify-center ">
        {selectedDate ? (
          <div className="mb-6">
            {selectedDate[0] && <table className="min-w-full divide-y divide-gray-200 text-sm overflow-y-scroll">
              <thead className="bg-clippersGray">
                <tr className="">
                  <th className="px-2 py-2 text-left font-medium text-clippersBlack uppercase tracking-wider select-none text-xs">Time</th>
                  <th className="px-2 py-2 text-left font-medium text-clippersBlack uppercase tracking-wider select-none text-xs">Team</th>
                  <th className="px-2 py-2 text-left font-medium text-clippersBlack uppercase tracking-wider select-none text-xs">Arena</th>
                  <th className="px-2 py-2 text-left font-medium text-clippersBlack uppercase tracking-wider select-none text-xs">Location</th>
                  <th className="px-2 py-2 text-left font-medium text-clippersBlack uppercase tracking-wider select-none text-xs">Broadcaster</th>
                </tr>
              </thead>
              <tbody>
                {gamesByDate[selectedDate]?.map(game => (
                  <tr key={game.Game_id} className="bg-clippersWhite divide-y divide-gray-200 max-h-[300px] overflow-y-scroll">
                    <td className="px-2 py-1 whitespace-nowrap text-xs text-clippersBlack">{game.Game_time}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-clippersBlack">{game.Team_city} {game.Team_name} ({game.Team_abr})</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-clippersBlack">{game.Arena_name}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-clippersBlack">{game.Location}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-clippersBlack">{game.Natnl}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </div>
        ) : (
          <p className="text-center text-clippersWhite">Please select a date to view games.</p>
        )}
      </div>
    </div>
  );
}