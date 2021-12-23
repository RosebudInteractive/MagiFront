import React from "react"
import './ui-kit.sass'

interface Props {
  title: string,
  className?: string,
  disabled?: boolean,
  onClick: () => void,
}

function Button(props: Props): JSX.Element {
  const { title, onClick, className } = props;

  return <button className={"ui-button ui-orange" + (className ? ` ${className}`: "")} onClick={onClick}>{title}</button>
}

export default React.memo(Button)
