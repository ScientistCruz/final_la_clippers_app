import React from "react";

const Home = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      {/* Main Container */}
      <div className="bg-clippersBlueTransparent rounded-lg overflow-hidden">
        {/* Clippers Logo */}
        <img
          src="https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg"
          alt="LA Clippers Logo"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />

        {/* Text Content */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
          <h1 className="text-3xl font-bold mb-4 justify-center">
            Welcome to the LA Clippers <br/>
            In-Game App Demo!
          </h1>
          <p></p>
          <p className="text-sm">
            Presented By Sara Cruz <br/> 
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;