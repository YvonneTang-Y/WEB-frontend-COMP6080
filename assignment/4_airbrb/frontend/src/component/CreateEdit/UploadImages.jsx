import React from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import styled from '@emotion/styled';
import DeleteIcon from '@mui/icons-material/Delete';
import { fileToDataUrl } from '../../helper';
const CenteredLi = styled.li`
  display: flex;
  align-items: center;
  height: auto;
`;

const UploadImages = (props) => {
  const { multiple, selectedFiles, setSelectedFiles, name } = props;

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    // const dataUrls = files.map((file) => URL.createObjectURL(file));
    const dataUrlPromises = files.map((file) => fileToDataUrl(file));
    try {
      const dataUrls = await Promise.all(dataUrlPromises);
      // console.log('dataUrls', dataUrls);
      if (multiple) {
        setSelectedFiles([...selectedFiles, ...dataUrls]);
      } else {
        const lastDataUrl = dataUrls[dataUrls.length - 1];
        setSelectedFiles([lastDataUrl]);
      }
    } catch (error) {
      console.error('Error converting files to Data URL:', error);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
    // clear file input
    const fileInput = document.getElementById(`${name}Input`);
    fileInput.value = null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'auto' }}>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id={name + 'Input'}
      />
      <label htmlFor={name + 'Input'}>
        <Button component="span" variant="outlined" startIcon={<CloudUploadIcon />} aria-label="Click me to upload images">
          Upload file
        </Button>
      </label>
      {selectedFiles.length > 0 &&
        <ul style={{ display: 'flex', flexDirection: 'column' }}>
          {selectedFiles.map((file, index) => (
            <>
              <CenteredLi key={name + index}>
                <img src={file} alt={name + index} style={{ width: '10vw' }} />
                {/* <img src={URL.createObjectURL(file)} alt="Selected" style={{ maxWidth: '100px', maxHeight: '100px' }} /> */}
                <Button
                  id={'delete-' + name + index}
                  startIcon={<DeleteIcon />}
                  sx={{ color: 'red' }}
                  onClick={() => removeFile(index)}
                  aria-label="Click me to delete the selected image"
                ></Button>
              </CenteredLi><br />
            </>
          ))}
        </ul>
      }
    </div>
  );
};

export default UploadImages;
