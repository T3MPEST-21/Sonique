import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const SoniqueLogo = React.forwardRef(({ size = 200, color = '#FFFFFF' }: { size?: number, color?: string }, ref) => {
    return (
        <View ref={ref as any} style={{
            width: size,
            height: size,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 15,
            elevation: 10,
        }}>
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <Path
                    d="M 35 25 
                       C 15 25, 15 50, 35 50
                       L 65 50
                       C 85 50, 85 75, 65 75
                       L 35 75"
                    fill="none"
                    stroke={color}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        </View>
    );
});
