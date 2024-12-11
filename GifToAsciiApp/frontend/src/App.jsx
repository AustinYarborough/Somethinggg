import React, { useState, useRef } from 'react';

function App() {
  const [frames, setFrames] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [settings, setSettings] = useState({
    width: 100,
    contrast: 1.0,
    saturation: 1.0,
    hue: 0,
    fontSize: 12
  });

  const animationRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    Object.keys(settings).forEach(key => {
      formData.append(key, settings[key]);
    });

    try {
      const response = await fetch('http://localhost:5000/convert', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setFrames(data.frames);
      setCurrentFrame(0);
    } catch (error) {
      console.error('Error converting GIF:', error);
    }
  };

  const toggleAnimation = () => {
    if (isPlaying) {
      cancelAnimationFrame(animationRef.current);
    } else {
      animate();
    }
    setIsPlaying(!isPlaying);
  };

  const animate = () => {
    setCurrentFrame((prev) => (prev + 1) % frames.length);
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="container">
      <h1>GIF to ASCII Converter</h1>
      
      <div className="file-input">
        <input 
          type="file" 
          accept=".gif" 
          onChange={handleFileUpload} 
        />
      </div>
      
      <div className="settings">
        <div className="setting-item">
          <label htmlFor="width">Width:</label>
          <input
            id="width"
            type="range"
            min="50"
            max="200"
            value={settings.width}
            onChange={(e) => handleSettingChange('width', e.target.value)}
          />
        </div>
        
        <div className="setting-item">
          <label htmlFor="contrast">Contrast:</label>
          <input
            id="contrast"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.contrast}
            onChange={(e) => handleSettingChange('contrast', e.target.value)}
          />
        </div>
        
        <div className="setting-item">
          <label htmlFor="saturation">Saturation:</label>
          <input
            id="saturation"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.saturation}
            onChange={(e) => handleSettingChange('saturation', e.target.value)}
          />
        </div>
        
        <div className="setting-item">
          <label htmlFor="hue">Hue:</label>
          <input
            id="hue"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.hue}
            onChange={(e) => handleSettingChange('hue', e.target.value)}
          />
        </div>
        
        <div className="setting-item">
          <label htmlFor="fontSize">Font Size:</label>
          <input
            id="fontSize"
            type="range"
            min="8"
            max="24"
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', e.target.value)}
          />
        </div>
      </div>

      {frames.length > 0 && (
        <div className="ascii-container">
          <div 
            className="ascii-display"
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            {frames[currentFrame]}
          </div>
          <button 
            className="control-button"
            onClick={toggleAnimation}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App; 