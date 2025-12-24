import React from 'react';
import Svg, { Rect, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { COLORS } from '../../constants';

interface LogoProps {
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ size = 100 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={COLORS.GRADIENT.START} />
          <Stop offset="100%" stopColor={COLORS.GRADIENT.END} />
        </LinearGradient>
      </Defs>
      
      {/* Premium Squircle Background */}
      <Rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="20"
        fill="url(#mainGrad)"
      />
      
      {/* Subtle glassmorphism background accent */}
      <Circle cx="85" cy="15" r="25" fill="white" fillOpacity={0.1} />
      
      {/* Catchy Geometric Bar Chart (Clean & Modern) */}
      <G>
        <Rect x="28" y="56" width="11" height="18" rx="5.5" fill="white" fillOpacity={0.4} />
        <Rect x="44.5" y="32" width="11" height="42" rx="5.5" fill="white" />
        <Rect x="61" y="46" width="11" height="28" rx="5.5" fill="white" fillOpacity={0.7} />
        
        {/* Floating "Insight" dot signifying tracking */}
        <Circle cx="50" cy="20" r="5" fill="white" />
      </G>
    </Svg>
  );
};

export default Logo;
