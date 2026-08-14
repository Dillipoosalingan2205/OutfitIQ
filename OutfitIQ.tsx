import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Sparkles, User, Shirt, Calendar, Star, ShoppingBag, ArrowRight, ArrowLeft, RotateCcw, Check } from 'lucide-react';

const SelfieCapture = ({ onCapture, title }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => setIsStreaming(true);
      }
    } catch (err) {
      setShowFileUpload(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(base64Image);
      stopCamera();
      
      if (onCapture) onCapture(base64Image);
    }
  };

  const handleFileUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        if (onCapture) onCapture(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowFileUpload(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="w-full">
      <label className="block text-lg font-medium text-gray-700 mb-3">{title}</label>
      
      <div className="relative mb-4">
        {!isStreaming && !capturedImage && !showFileUpload && (
          <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-purple-300">
            <div className="text-center">
              <Camera className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <button
                onClick={startCamera}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 mb-3"
              >
                <Camera className="w-5 h-5 inline mr-2" />
                Open Camera
              </button>
              <p className="text-gray-400 text-sm mb-2">or</p>
              <button
                onClick={() => setShowFileUpload(true)}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg"
              >
                <Upload className="w-5 h-5 inline mr-2" />
                Upload File
              </button>
            </div>
          </div>
        )}

        {showFileUpload && !capturedImage && (
          <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-purple-300">
            <div className="text-center">
              <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg mb-3"
              >
                Choose File
              </button>
              <button
                onClick={() => setShowFileUpload(false)}
                className="block mx-auto text-gray-600"
              >
                Back to Camera
              </button>
            </div>
          </div>
        )}

        {isStreaming && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 rounded-xl shadow-lg object-cover transform scale-x-[-1]"
            />
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
              <div className="w-2 h-2 bg-white rounded-full inline-block mr-1 animate-pulse"></div>
              LIVE
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="relative">
            <img src={capturedImage} alt="Captured" className="w-full h-64 rounded-xl shadow-lg object-cover" />
            <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
              <Check className="w-4 h-4" />
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-4 justify-center">
        {isStreaming && (
          <>
            <button onClick={stopCamera} className="px-6 py-2 border rounded-lg">Cancel</button>
            <button onClick={capturePhoto} className="bg-purple-600 text-white px-8 py-3 rounded-lg">
              <Camera className="w-5 h-5 inline mr-2" />
              Capture
            </button>
          </>
        )}

        {capturedImage && (
          <button onClick={retakePhoto} className="bg-gray-600 text-white px-6 py-3 rounded-lg">
            <RotateCcw className="w-5 h-5 inline mr-2" />
            Retake
          </button>
        )}
      </div>
    </div>
  );
};

const OutfitIQ = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [userInfo, setUserInfo] = useState({
    gender: '',
    height: '',
    weight: '',
    selfie: null,
    fullBody: null
  });
  const [wardrobe, setWardrobe] = useState([]);
  const [occasion, setOccasion] = useState({
    timeOfDay: '',
    eventType: ''
  });
  const [outfitSuggestions, setOutfitSuggestions] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleSelfieCapture = (base64Image) => {
    setUserInfo(prev => ({ ...prev, selfie: { dataUrl: base64Image, name: 'selfie.jpg' } }));
  };

  const handleFullBodyCapture = (base64Image) => {
    setUserInfo(prev => ({ ...prev, fullBody: { dataUrl: base64Image, name: 'fullbody.jpg' } }));
  };

  const handleWardrobeUpload = (files, category) => {
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setWardrobe(prev => [...prev, {
            id: Date.now() + Math.random(),
            dataUrl: e.target.result,
            name: file.name,
            category: category
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const analyzeAndGenerateOutfits = () => {
    setCurrentPage(4);
    
    setTimeout(() => {
      const isTraditional = ['Traditional', 'Wedding', 'Festival'].includes(occasion.eventType);
      const tops = wardrobe.filter(item => item.category === 'tops');
      const bottoms = wardrobe.filter(item => item.category === 'bottoms');
      const shoes = wardrobe.filter(item => item.category === 'shoes');
      const accessories = wardrobe.filter(item => item.category === 'accessories');
      
      const outfits = [];
      for (let i = 0; i < Math.min(3, tops.length, bottoms.length); i++) {
        const items = [
          `Item ${wardrobe.findIndex(w => w.id === tops[i].id) + 1}`,
          `Item ${wardrobe.findIndex(w => w.id === bottoms[i].id) + 1}`
        ];
        if (shoes[i]) items.push(`Item ${wardrobe.findIndex(w => w.id === shoes[i].id) + 1}`);
        if (accessories[i]) items.push(`Item ${wardrobe.findIndex(w => w.id === accessories[i].id) + 1}`);
        
        outfits.push({
          name: isTraditional ? ['Traditional Elegance', 'Festive Charm', 'Cultural Grace'][i] : ['Modern Chic', 'Sophisticated Style', 'Contemporary Look'][i],
          items: items,
          reasoning: `Perfect for ${occasion.eventType} during ${occasion.timeOfDay}`
        });
      }
      
      setOutfitSuggestions({
        outfits: outfits,
        stylingTips: 'Style according to occasion and comfort',
        colorAdvice: 'Coordinate colors for best effect',
        upgradeRecommendations: 'Add versatile pieces to expand options'
      });
      setCurrentPage(5);
    }, 2000);
  };

  const pages = [
    // Splash
    <div key="splash" className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <Sparkles className="w-24 h-24 mx-auto mb-6 animate-pulse" />
        <h1 className="text-6xl font-bold mb-4">OutfitIQ</h1>
        <p className="text-xl mb-8">Your Smart Fashion Stylist</p>
        <button onClick={() => setCurrentPage(1)} className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-pink-50">
          Get Started <ArrowRight className="inline ml-2 w-5 h-5" />
        </button>
      </div>
    </div>,

    // User Info
    <div key="userinfo" className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold mb-8"><User className="inline w-8 h-8 mr-3" />Tell Us About You</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium mb-3">Gender</label>
              <div className="flex gap-4">
                {['Male', 'Female', 'Other'].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setUserInfo(prev => ({...prev, gender}))}
                    className={`px-6 py-3 rounded-full font-medium ${
                      userInfo.gender === gender ? 'bg-purple-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={userInfo.height}
                  onChange={(e) => setUserInfo(prev => ({...prev, height: e.target.value}))}
                  className="w-full p-3 border-2 rounded-xl"
                  placeholder="170"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={userInfo.weight}
                  onChange={(e) => setUserInfo(prev => ({...prev, weight: e.target.value}))}
                  className="w-full p-3 border-2 rounded-xl"
                  placeholder="65"
                />
              </div>
            </div>

            <SelfieCapture title="Take Your Selfie" onCapture={handleSelfieCapture} />
            <SelfieCapture title="Take Full Body Photo" onCapture={handleFullBodyCapture} />
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={() => setCurrentPage(0)} className="px-6 py-3">
              <ArrowLeft className="inline w-5 h-5 mr-2" />Back
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              disabled={!userInfo.gender || !userInfo.height || !userInfo.weight || !userInfo.selfie || !userInfo.fullBody}
              className="bg-purple-600 text-white px-8 py-3 rounded-full disabled:opacity-50"
            >
              Next <ArrowRight className="inline ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>,

    // Wardrobe
    <div key="wardrobe" className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold mb-8"><Shirt className="inline w-8 h-8 mr-3" />Your Wardrobe</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { name: 'Tops', category: 'tops', color: 'purple', emoji: '👕' },
              { name: 'Bottoms', category: 'bottoms', color: 'blue', emoji: '👖' },
              { name: 'Shoes', category: 'shoes', color: 'orange', emoji: '👟' },
              { name: 'Accessories', category: 'accessories', color: 'pink', emoji: '👑' }
            ].map((cat) => {
              const bgColor = cat.color === 'purple' ? 'bg-purple-50' : cat.color === 'blue' ? 'bg-blue-50' : cat.color === 'orange' ? 'bg-orange-50' : 'bg-pink-50';
              const borderColor = cat.color === 'purple' ? 'border-purple-200' : cat.color === 'blue' ? 'border-blue-200' : cat.color === 'orange' ? 'border-orange-200' : 'border-pink-200';
              const hoverColor = cat.color === 'purple' ? 'hover:bg-purple-100' : cat.color === 'blue' ? 'hover:bg-blue-100' : cat.color === 'orange' ? 'hover:bg-orange-100' : 'hover:bg-pink-100';
              
              return (
                <div key={cat.category} className={`${bgColor} rounded-2xl p-6 border ${borderColor}`}>
                  <h3 className="text-lg font-bold mb-2">{cat.emoji} {cat.name}</h3>
                  <p className="text-sm mb-4 text-gray-600">{wardrobe.filter(i => i.category === cat.category).length} items</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleWardrobeUpload(e.target.files, cat.category)}
                    className="hidden"
                    id={`${cat.category}-upload`}
                  />
                  <button
                    onClick={() => document.getElementById(`${cat.category}-upload`).click()}
                    className={`w-full p-3 border-2 border-dashed rounded-lg ${borderColor} ${hoverColor}`}
                  >
                    <Upload className="w-5 h-5 mx-auto" />
                  </button>
                </div>
              );
            })}
          </div>

          {wardrobe.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Your Items ({wardrobe.length})</h3>
              {['tops', 'bottoms', 'shoes', 'accessories'].map((category) => {
                const items = wardrobe.filter(item => item.category === category);
                if (items.length === 0) return null;
                
                return (
                  <div key={category} className="mb-4">
                    <h4 className="font-medium mb-2 capitalize">{category} ({items.length})</h4>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {items.map((item) => {
                        const globalIndex = wardrobe.findIndex(w => w.id === item.id) + 1;
                        return (
                          <div key={item.id} className="relative group">
                            <img src={item.dataUrl} alt={item.name} className="w-full h-20 object-cover rounded-lg" />
                            <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-2 py-0.5 rounded">
                              #{globalIndex}
                            </div>
                            <button
                              onClick={() => setWardrobe(prev => prev.filter(w => w.id !== item.id))}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setCurrentPage(1)} className="px-6 py-3">
              <ArrowLeft className="inline w-5 h-5 mr-2" />Back
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              disabled={wardrobe.length === 0}
              className="bg-green-600 text-white px-8 py-3 rounded-full disabled:opacity-50"
            >
              Next <ArrowRight className="inline ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>,

    // Occasion
    <div key="occasion" className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold mb-8"><Calendar className="inline w-8 h-8 mr-3" />What's the Occasion?</h2>

          <div className="space-y-8">
            <div>
              <label className="block text-xl font-semibold mb-4">Time of Day</label>
              <div className="grid grid-cols-2 gap-3">
                {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setOccasion(prev => ({...prev, timeOfDay: time}))}
                    className={`p-4 rounded-xl font-medium ${
                      occasion.timeOfDay === time ? 'bg-orange-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xl font-semibold mb-4">Event Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Formal', 'Semi-formal', 'Casual', 'Party',
                  'Streetwear', 'Classy', 'Traditional', 'Sporty',
                  'Date Night', 'Interview', 'Wedding', 'Festival'
                ].map((event) => {
                  const isTraditional = ['Traditional', 'Wedding', 'Festival'].includes(event);
                  return (
                    <button
                      key={event}
                      onClick={() => setOccasion(prev => ({...prev, eventType: event}))}
                      className={`p-4 rounded-xl font-medium ${
                        occasion.eventType === event
                          ? isTraditional
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                            : 'bg-pink-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {event === 'Traditional' && '🪔 '}
                      {event === 'Wedding' && '💒 '}
                      {event === 'Festival' && '🎊 '}
                      {event}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-10">
            <button onClick={() => setCurrentPage(2)} className="px-6 py-3">
              <ArrowLeft className="inline w-5 h-5 mr-2" />Back
            </button>
            <button
              onClick={analyzeAndGenerateOutfits}
              disabled={!occasion.timeOfDay || !occasion.eventType}
              className="bg-gradient-to-r from-orange-600 to-pink-600 text-white px-8 py-3 rounded-full disabled:opacity-50"
            >
              Analyze & Generate Outfits <Sparkles className="inline ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>,

    // Loading
    <div key="loading" className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <Sparkles className="w-24 h-24 mx-auto mb-6 animate-spin" />
        <h1 className="text-4xl font-bold mb-4">Analyzing Your Style...</h1>
        <p className="text-xl">Creating perfect outfit combinations just for you</p>
      </div>
    </div>,

    // Results
    <div key="results" className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold"><Star className="inline w-8 h-8 mr-3" />Your Perfect Outfits</h2>
            <button
              onClick={() => setShowUpgrade(!showUpgrade)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full"
            >
              <ShoppingBag className="inline mr-2 w-5 h-5" />
              Upgrade Wardrobe
            </button>
          </div>

          {outfitSuggestions?.outfits && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {outfitSuggestions.outfits.map((outfit, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold">{outfit.name}</h3>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-3">Outfit Items:</h4>
                    <div className="space-y-2">
                      {outfit.items.map((item, idx) => {
                        const itemNum = parseInt(item.replace('Item ', ''));
                        return (
                          <div key={idx} className="flex items-center bg-indigo-50 rounded-lg p-3">
                            <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                              {itemNum}
                            </div>
                            <span className="text-indigo-900 font-semibold">{item}</span>
                            {wardrobe[itemNum - 1] && (
                              <img 
                                src={wardrobe[itemNum - 1].dataUrl} 
                                alt={`Item ${itemNum}`}
                                className="w-12 h-12 rounded-lg object-cover ml-auto border-2 border-indigo-200"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-800 mb-2">Why it works:</h4>
                    <p className="text-indigo-700 text-sm">{outfit.reasoning}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-6">
            {outfitSuggestions?.stylingTips && (
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4">
                  <Sparkles className="inline w-6 h-6 mr-2" />
                  Styling Tips
                </h3>
                <p className="text-green-700">{outfitSuggestions.stylingTips}</p>
              </div>
            )}

            {outfitSuggestions?.colorAdvice && (
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-4">
                  <Star className="inline w-6 h-6 mr-2" />
                  Color & Pattern Advice
                </h3>
                <p className="text-blue-700">{outfitSuggestions.colorAdvice}</p>
              </div>
            )}
          </div>

          {showUpgrade && outfitSuggestions?.upgradeRecommendations && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 mb-6">
              <h3 className="text-xl font-bold text-purple-800 mb-4">
                <ShoppingBag className="inline w-6 h-6 mr-2" />
                Wardrobe Upgrade Recommendations
              </h3>
              <p className="text-purple-700">{outfitSuggestions.upgradeRecommendations}</p>
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setCurrentPage(3)} className="px-6 py-3">
              <ArrowLeft className="inline w-5 h-5 mr-2" />Back to Occasion
            </button>
            <button
              onClick={() => {
                setCurrentPage(0);
                setUserInfo({ gender: '', height: '', weight: '', selfie: null, fullBody: null });
                setWardrobe([]);
                setOccasion({ timeOfDay: '', eventType: '' });
                setOutfitSuggestions(null);
                setShowUpgrade(false);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full"
            >
              Start Over <Sparkles className="inline ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  ];

  return <div className="font-sans">{pages[currentPage]}</div>;
};

export default OutfitIQ;
