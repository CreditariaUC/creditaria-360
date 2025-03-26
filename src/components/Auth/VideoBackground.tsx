import React, { useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import { LoginVideo } from './LoginVideo';

export const VideoBackground: React.FC = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <Player
        component={LoginVideo}
        durationInFrames={120}
        compositionWidth={dimensions.width}
        compositionHeight={dimensions.height}
        fps={30}
        loop
        style={{
          width: '100%',
          height: '100%',
        }}
        controls={false}
        showVolumeControls={false}
        autoPlay
      />
    </div>
  );
};