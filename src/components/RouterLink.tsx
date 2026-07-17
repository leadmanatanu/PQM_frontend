import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export const Link = React.forwardRef<HTMLAnchorElement, any>(
  ({ href, children, ...props }, ref) => {
    return (
      <RouterLink ref={ref} to={href} {...props}>
        {children}
      </RouterLink>
    );
  }
);

export default Link;