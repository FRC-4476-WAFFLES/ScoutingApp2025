import React from 'react';
import Svg, { Path } from "react-native-svg"

const DropDownArrow = props => {
    return (
        <Svg
            width={63}
            height={38}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <Path d="m4 4 27.5 27.5L59 4" stroke="#000" strokeWidth={9} />
        </Svg>
    )
}

export default DropDownArrow;
