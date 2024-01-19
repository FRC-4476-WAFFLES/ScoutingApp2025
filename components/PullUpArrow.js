import React from 'react';
import Svg, { Path } from "react-native-svg"

const PullUpArrow = props => {
    return (
        <Svg
            width={63}
            height={38}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <Path d="M59 34.5 31.5 7 4 34.5" stroke="#000" strokeWidth={9} />
        </Svg>
    )
}

export default PullUpArrow;
