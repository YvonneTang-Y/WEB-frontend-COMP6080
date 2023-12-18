import React from 'react';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// component for image viewer: shown on the selected listing page
const ImageViewer = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // define style for different parts
  const styles = {
    imageViewerContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '20px',
      outline: 'none',
    },
    imageViewer: {
      position: 'relative',
      width: '40vw',
      height: '40vw',
      margin: 'auto',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      display: 'block',
      margin: 'auto',
      objectPosition: 'center', // display center
    },
    button: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      padding: '5px 10px',
      cursor: 'pointer',
    },
    prevButton: {
      position: 'absolute',
      top: '50%',
      left: 0,
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(255, 255, 255, 70%)',
      border: '1px solid #ccc',
      padding: '5px 10px',
      cursor: 'pointer',
    },
    nextButton: {
      position: 'absolute',
      top: '50%',
      right: 0,
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(255, 255, 255, 70%)',
      border: '1px solid #ccc',
      padding: '5px 10px',
      cursor: 'pointer',
    },

    previewContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginLeft: '5vw',
      height: '40vw',
      maxHeight: '60vh',
      overflowY: 'auto',
    },
    previewImage: {
      width: '9vw',
      // height: '9vh',
      objectFit: 'contain',
      display: 'block',
      margin: 'auto',
      objectPosition: 'center', // display center
      border: '2px solid transparent',
    },
    highlightedPreview: {
      border: '2px solid #007bff',
    },
  };

  // when clicking on the left arrow
  const handlePrevClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };

  // when clicking on the right arrow
  const handleNextClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  };

  // when clicking on the thumbnail list
  const handlePreviewClick = (index) => {
    setCurrentImageIndex(index);
  };

  // use keyboard to control the image viewer
  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      handlePrevClick();
    } else if (event.key === 'ArrowRight') {
      handleNextClick();
    }
  };

  return (
    <div>
      {/* image viewer */}
      <div style={styles.imageViewerContainer} onKeyDown={handleKeyDown} tabIndex='0'>
        <div style={styles.imageViewer}>
          <img src={images[currentImageIndex]} alt={`Image ${currentImageIndex + 1}`} style={styles.image} />
          <NavigateBeforeIcon fontSize='small' style={styles.prevButton} onClick={handlePrevClick} aria-label="Click me to next image"/>
          <NavigateNextIcon fontSize='small' style={styles.nextButton} onClick={handleNextClick} aria-label="Click me to previous image"/>
        </div>
        {/* small images */}
        <div style={styles.previewContainer}>
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Preview ${index + 1}`}
              style={{ ...styles.previewImage, ...(index === currentImageIndex ? styles.highlightedPreview : {}) }}
              onClick={() => handlePreviewClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
