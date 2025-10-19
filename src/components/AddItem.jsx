import React, { useState, useRef, useEffect } from 'react';
import { Camera, Package, Upload, X, Square } from 'lucide-react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { barcodeAPI, fridgeAPI, uploadAPI } from '../services/api';

const AddItem = () => {
  const [showScanner, setShowScanner] = useState(false);
  //const [showBarcodeForm, setShowBarcodeForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const [manualForm, setManualForm] = useState({
    name: '',
    type: 'vegetable',
    expiryDate: '',
    quantity: 1
  });

  // Scanner functions
  const startScanner = async () => {
    try {
      setScanning(true);
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;
      
      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices[0]?.deviceId;
      
      if (!selectedDeviceId) {
        alert('No camera found. Please ensure your device has a camera.');
        setScanning(false);
        return;
      }

      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const barcode = result.getText();
            setScannedCode(barcode);
            handleBarcodeScan(barcode);
            stopScanner();
          }
          if (error && !error.message.includes('NotFoundException')) {
            console.error('Scanner error:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      alert('Error accessing camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setScanning(false);
  };

  const handleBarcodeScan = async (barcode) => {
    setLoading(true);
    try {
      const response = await barcodeAPI.scanBarcode(barcode);
      const productData = response.data;
      console.log(productData);

      const food = productData.foods[0]

      // Add to fridge with product data

      setManualForm({
        name: food.description,
        type: food.foodCategory || 'other',
        expirationDate: '', //NEED TO PROVIDE PAGE TO ENTER EXPIRATION DATE
        barcode: barcode,
        nutritionFacts: food.foodNutrients,
        servingCount: '', //ENTER IN NEXT PAGE
        servingSize: '' //ENTER IN NEXT PAGE
      });


      /*await fridgeAPI.addItem({
        name: food.description,
        type: food.foodCategory || 'other',
        expirationDate: 'fake expiration', //NEED TO PROVIDE PAGE TO ENTER EXPIRATION DATE
        barcode: barcode,
        nutritionFacts: food.foodNutrients,
        servingCount: '1', //ENTER IN NEXT PAGE
        servingSize: '1 gallon' //ENTER IN NEXT PAGE
      });*/

      //alert('Item added to fridge successfully!');
      setShowScanner(false);
    } catch (error) {
      console.error('Error scanning barcode:', error);
      alert('Error scanning barcode. Please try again.');
    } finally {
      setLoading(false);
      setShowManualForm(true);
    }
  };

  // Cleanup scanner when component unmounts or scanner closes
  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  useEffect(() => {
    if (showScanner && !scanning) {
      startScanner();
    } else if (!showScanner && scanning) {
      stopScanner();
    }
  }, [showScanner]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fridgeAPI.addItem(manualForm);
      alert('Item added to fridge successfully!');
      setShowManualForm(false);
      setManualForm({
        name: '',
        type: 'other',
        expirationDate: '',
        barcode: '',
        nutritionFacts: [],
        servingCount: '',
        servingSize: ''
      });
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    try {
      const response = await uploadAPI.uploadFile(file);
      const parsedItems = response.data.items;

      // Add parsed items to fridge
      for (const item of parsedItems) {
        await fridgeAPI.addItem(item);
      }

      alert(`Successfully added ${parsedItems.length} items to your fridge!`);
      setShowUpload(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error parsing image/video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Add Items to Your Fridge</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            className="button"
            onClick={() => setShowScanner(true)}
            disabled={loading}
          >
            <Camera style={{ marginRight: '0.5rem' }} />
            Scan Barcode
          </button>

          <button
            className="button secondary"
            onClick={() => setShowManualForm(true)}
            disabled={loading}
          >
            <Package style={{ marginRight: '0.5rem' }} />
            Add Manually
          </button>

          <button
            className="button secondary"
            onClick={() => setShowUpload(true)}
            disabled={loading}
          >
            <Upload style={{ marginRight: '0.5rem' }} />
            Upload Image/Video
          </button>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowScanner(false)}>
              <X />
            </button>
            <h3>Scan Barcode</h3>
            <div className="scanner-container">
              <p>Point your camera at a barcode to scan</p>
              <div className="video-container">
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    height: '300px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    background: '#000'
                  }}
                  playsInline
                  muted
                />
                {scanning && (
                  <div className="scanner-overlay">
                    <div className="scanner-frame"></div>
                    <p className="scanner-text">Position barcode within the frame</p>
                  </div>
                )}
              </div>
              {scannedCode && (
                <div className="scanned-result">
                  <p>Scanned: {scannedCode}</p>
                </div>
              )}
              <div className="scanner-controls">
                <button 
                  className="button secondary"
                  onClick={stopScanner}
                  disabled={!scanning}
                >
                  <Square size={16} />
                  Stop Scanner
                </button>
                <button 
                  className="button"
                  onClick={startScanner}
                  disabled={scanning}
                >
                  <Camera size={16} />
                  Start Scanner
                </button>
              </div>
              
              {/* Manual Product Entry Fallback */}
              <div className="manual-entry-fallback">
                <p style={{ margin: '1rem 0', color: '#666', fontSize: '0.9rem' }}>
                  Camera not working? Add product manually:
                </p>
                <button 
                  className="button"
                  onClick={() => {
                    setShowScanner(false);
                    setShowManualForm(true);
                  }}
                  style={{ width: '100%' }}
                >
                  <Package size={16} />
                  Add Product Manually
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Form Modal */}
      {showManualForm && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowManualForm(false)}>
              <X />
            </button>
            <h3>Add Item</h3>
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                className="input"
                placeholder="Item name"
                value={manualForm.name}
                onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                required
              />

              <input
                type="text"
                className="input"
                placeholder="Item type"
                value={manualForm.type}
                onChange={(e) => setManualForm({...manualForm, type: e.target.value})}
                required
              />

              <label for="expiration">Expiration Date</label>
              <input
                type="date"
                className="input"
                name="expiration"
                value={manualForm.expirationDate}
                onChange={(e) => setManualForm({...manualForm, expirationDate: e.target.value})}
                required
              />

              <input
                type="number"
                className="input"
                placeholder="Quantity"
                value={manualForm.servingCount}
                onChange={(e) => setManualForm({...manualForm, servingCount: parseInt(e.target.value)})}
                min="1"
                required
              />

              <input
                type="number"
                className="input"
                placeholder="Quantity Units"
                value={manualForm.servingSize}
                onChange={(e) => setManualForm({...manualForm, servingSize: parseInt(e.target.value)})}
                min="1"
                required
              />

              <button type="submit" className="button" disabled={loading}>
                {loading ? 'Adding...' : 'Add to Fridge'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showUpload && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowUpload(false)}>
              <X />
            </button>
            <h3>Upload Image/Video</h3>
            <FileUpload onFileSelect={handleFileUpload} loading={loading} />
          </div>
        </div>
      )}
    </div>
  );
};

const FileUpload = ({ onFileSelect, loading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`upload-area ${dragActive ? 'dragover' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Upload size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
      <p>Drag and drop an image or video here</p>
      <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
        or click to select a file
      </p>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleChange}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload" style={{ cursor: 'pointer', marginTop: '1rem', display: 'inline-block' }}>
        <button className="button" disabled={loading}>
          {loading ? 'Processing...' : 'Choose File'}
        </button>
      </label>
    </div>
  );
};

export default AddItem;
