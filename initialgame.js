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
    ? 'green'
    : isOver && canDrop
    ? 'yellow'
    : 'white';

  return (
    <div
      ref={type === 'key' ? drag : drop}
      className="image-box"
      style={{ opacity, backgroundColor, visibility: isMatched && type === 'key' ? 'hidden' : 'visible' }}
    >
      <img src={src} alt="Drag and Drop" />
    </div>
  );
};

const Imagedisplay = () => {
  const [data, setData] = useState({});
  const [matchedKeys, setMatchedKeys] = useState([]);
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setData(jsonData[0]);
  }, []);

  const handleDrop = (draggedSrc, droppedSrc) => {
    // Check if draggedSrc is the key for droppedSrc in data
    if (data[draggedSrc] === droppedSrc) {
      setMessage('Correct!');
      setMatchedKeys((prevMatchedKeys) => [...prevMatchedKeys, draggedSrc]);
      setShowConfetti(true); // Show confetti upon correct drop
      setTimeout(() => setShowConfetti(false), 10000); // Hide confetti after 10 seconds
    } else {
      setMessage('Wrong!');
    }
  };

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className="data-container">
        {Object.entries(data).map(([key, value], index) => (
          <div className="data-row" key={index}>
            <ImageBox
              src={key}
              type="key"
              isMatched={matchedKeys.includes(key)}
            />
            <ImageBox
              src={value}
              type="value"
              onDrop={handleDrop}
              isMatched={matchedKeys.includes(key)}
              isFixed={matchedKeys.includes(key)}
            />
          </div>
        ))}
      </div>
      {message && (
        <div className={`message ${message === 'Correct!' ? 'correct' : 'wrong'}`}>
          {message}
        </div>
      )}
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
    </DndProvider>
  );
};

export default Imagedisplay;
