import * as React from "react"
import Svg, { Rect, Path, Circle } from "react-native-svg"

function ActivityformIcon(props: any) {
  return (
    <Svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill={"none"}
      stroke="white"
      strokeWidth={2.5}
      style={{
        verticalAlign: "-2px",
        marginRight: 3
      }}
      {...props}
    >
      <Rect x={8} y={2} width={8} height={4} rx={1} />
      <Path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    </Svg>
  )
}

function AttendeesIcon(props: any) {
  return (
    <Svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth={2.5}
      style={{
        verticalAlign: "-2px",
        marginRight: 3
      }}
      {...props}
    >
      <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <Circle cx={9} cy={7} r={4} />
    </Svg>
  )
}
function EditIcon(props: any) {
  return (
    <Svg
      width={props?.size ||15}
      height={props?.size ||15}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props?.color ||"currentColor"}
      strokeWidth={2.5}
      {...props}
    >
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
  )
}

export { ActivityformIcon, AttendeesIcon, EditIcon }
