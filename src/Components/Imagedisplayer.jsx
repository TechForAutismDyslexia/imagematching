import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isMobile } from 'react-device-detect';
import Confetti from 'react-confetti';
import './Imagedisplay.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.joywithlearning.com/api/imagematching/games/6718c58adc6207cc23ff466a');
        const fetchedData = response.data.items[currentPage];
        
        if (fetchedData) {
          const loadedData = {};
          await Promise.all(
            fetchedData.map(async (item) => {
              const importedKey = await import(`../assets/images/${item.key}.png`);
              const importedValue = await import(`../assets/images/${item.value}.png`);
              loadedData[importedKey.default] = importedValue.default;
            })
          );
          setData(loadedData);
          setKeys(shuffleArray(Object.keys(loadedData)));
          setValues(shuffleArray(Object.values(loadedData)));
          setMatchedKeys([]);
          setMatchedValues([]);
          setShowConfetti(false);
        } else {
          console.error(`No data found for page ${currentPage}`);
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };

    fetchData();
  }, [currentPage]);

  useEffect(() => {
    let startTime = new Date().getTime();
    let timerInterval = setInterval(() => {
      const currentTime = new Date().getTime();
      const elapsedTimer = currentTime - startTime;
      setTimer(elapsedTimer);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const handleDrop = (draggedSrc, droppedSrc) => {
    setTries(prevTries => prevTries + 1);
    const matchedKey = Object.keys(data).find(key => data[key] === droppedSrc);
    if (matchedKey === draggedSrc) {
      setMatchedKeys((prevMatchedKeys) => [...prevMatchedKeys, draggedSrc]);
      setMatchedValues((prevMatchedValues) => [...prevMatchedValues, droppedSrc]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Object.keys(data).length) {
      setKeys([]);
      setValues([]);
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const logdata = async () => {
    console.log('Tries:', tries);
    console.log('Timer:', timer);
    try {
      localStorage.setItem('tries', tries);
      localStorage.setItem('timer', timer);
      const gameId = localStorage.getItem('gameId');
      const childId = localStorage.getItem('childId');
      const fixtimer = timer / 1000;
      const token = localStorage.getItem('logintoken');
      const response = await axios.put(`https://jwlgamesbackend.vercel.app/api/caretaker/${gameId}/${childId}`, {
        tries,
        timer: fixtimer,
        status: true,
      }, {
        headers: {
          "Authorization": `${token}`
        }
      });

      console.log(response);
      navigate('/result');
    } catch (err) {
      console.error(err);
    }
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
        {currentPage < Object.keys(data).length ? (
          <div className='d-flex justify-content-center align-items-center'>
            <button onClick={handleNextPage} id='nextbutton' className="btn btn-custom mt-2">
              Next
            </button>
          </div>
        ) : (
          <div className='d-flex justify-content-center align-items-center'>
            <button onClick={logdata} id='logdata' className="btn btn-custom mt-2">
              Logdata
            </button>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default Imagedisplay;
