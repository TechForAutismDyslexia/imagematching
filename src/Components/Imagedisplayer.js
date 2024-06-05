import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isMobile } from 'react-device-detect';
import Confetti from 'react-confetti';
import './Imagedisplay.css';
import jsonData from './images.json';

const ItemTypes = {
  IMAGE: 'image',
};

// Helper function to shuffle an array
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const ImageBox = ({ src, type, onDrop, isMatched, isFixed }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.IMAGE,
    item: { src },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !isFixed,
  }), [isFixed]);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.IMAGE,
    drop: (item) => onDrop(item.src, src),
    canDrop: (item) => type === 'value' && !isMatched,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [isMatched]);

  const opacity = isDragging ? 0.4 : 1;
  const backgroundColor = isMatched
    ? 'transparent'
    : isOver && canDrop
    ? 'yellow'
    : 'transparent';

  return (
    <div
      ref={type === 'key' ? drag : drop}
      className="image-box"
      style={{ opacity, backgroundColor, visibility: isMatched && type === 'value' ? 'hidden' : 'visible' }}
    >
      <img src={src} alt="Drag and Drop" onError={() => console.error(`Error loading image: ${src}`)} />
    </div>
  );
};

const Imagedisplay = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({});
  const [keys, setKeys] = useState([]);
  const [values, setValues] = useState([]);
  const [matchedKeys, setMatchedKeys] = useState([]);
  const [matchedValues, setMatchedValues] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    const pageData = jsonData[currentPage];
    if (pageData) {
      setData(pageData);
      setKeys(shuffleArray(Object.keys(pageData)));
      setValues(shuffleArray(Object.values(pageData)));
      setMatchedKeys([]);
      setMatchedValues([]);
      setShowConfetti(false);
      setTries(0);
      console.log(`Loaded data for page ${currentPage}`, pageData); // Debugging log
    } else {
      console.error(`No data found for page ${currentPage}`); // Error handling
    }
  }, [currentPage]);

  const handleDrop = (draggedSrc, droppedSrc) => {
    setTries(prevTries => prevTries + 1);
    const matchedKey = Object.keys(data).find(key => data[key] === droppedSrc);
    console.log(`Matched key for ${droppedSrc}: ${matchedKey}`); // Debugging log
    console.log(`Dropped ${draggedSrc} on ${droppedSrc}`); // Debugging log
    if (matchedKey === draggedSrc) {

      setMatchedKeys((prevMatchedKeys) => [...prevMatchedKeys, draggedSrc]);
      setMatchedValues((prevMatchedValues) => [...prevMatchedValues, droppedSrc]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Object.keys(jsonData).length) {
      setKeys([]);
      setValues([]);
      setCurrentPage((prevPage) => prevPage + 1);
      console.log(matchedKeys);
      console.log(matchedValues);
    }
  };

  const handleRestart = () => {
    setCurrentPage(1);
  };

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className='maincontainer'>
        <div className="title">
          <h1 className='text align text-center'>Match the images</h1>
          <p className='mt-0 tries-text fw-bold text-danger'>Tries: {tries}</p>
        </div>
        <div className="data-container">
          <div className="keys-column">
            {keys.map((key, index) => (
              <ImageBox
                key={index}
                src={key}
                type="key"
                isMatched={matchedKeys.includes(key)}
              />
            ))}
          </div>
          <div className="values-column">
            {values.map((value, index) => (
              <ImageBox
                key={index}
                src={value}
                type="value"
                onDrop={handleDrop}
                isMatched={matchedValues.includes(value)}
                isFixed={matchedValues.includes(value)}
              />
            ))}
          </div>
        </div>
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
        {currentPage < Object.keys(jsonData).length ? (
          <div className='d-flex justify-content-center align-items-center'>
            <button onClick={handleNextPage} className="btn btn-primary mt-2">
              Next
            </button>
          </div>
        ) : (
          <div>
            <button onClick={handleRestart} className="btn btn-primary mt-5">
              Restart
            </button>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default Imagedisplay;
