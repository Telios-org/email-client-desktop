import React from 'react';

// INTERNAL RESOURCES
import ConstellationSVG from '../../images/NetworkGraph.svg';


// STILL NEED TO IMPLEMENT ROTATING CAROUSEL FOR THE WORDS (MAYBE THE PIC TOO), AT LEAST 3 SO WE CAN PLACE 3 DOTS UNDER

const NetworkCarousel = () => {
  return (
    <>
      <div className="min-h-[280px]">
        <img
          src={ConstellationSVG}
          className="w-[80%] mx-auto"
          alt="React Logo"
        />
      </div>
      <div className="flex flex-1 flex-col ml-10 mr-3 mt-10">
        <div className="text-gray-300 text-base font-semibold pb-3">
          Peer-to-Peer
        </div>
        <div className="text-white text-base font-semibold">
          Communicate with your friends, colleagues and more via our
          peer-to-peer, encrypted and private network.
        </div>
      </div>
    </>
  );
};

export default NetworkCarousel;
