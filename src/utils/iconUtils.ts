import React from 'react';
import { IconType } from 'react-icons';

export const renderIcon = (IconComponent: IconType) => {
  return React.createElement(IconComponent as any, {});
};