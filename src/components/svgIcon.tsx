import { Component, createRoot } from "solid-js";

export enum Icons {
  "default",
}

interface SvgIconProps {
  name: Icons;
}

const SvgIcon: Component<SvgIconProps> = (props) => {
  return (
    <svg>
      <use href={props.name.toString()} />
    </svg>
  );
};

export const svgIcon = (name: Icons) => {
  return createRoot((dispose) => {
    dispose();
    return (
      <svg>
        <use href={name.toString()} />
      </svg>
    );
  });
};

export default SvgIcon;
