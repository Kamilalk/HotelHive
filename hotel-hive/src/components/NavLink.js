import { useHistory } from 'react-router-dom';

const NavLink = ({ to, children, ...props }) => {
  const history = useHistory();

  const handleClick = (e) => {
    e.preventDefault();
    history.push(to);
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

export default NavLink;