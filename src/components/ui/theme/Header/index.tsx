import { useEffect, useState } from 'react';
import cx from 'classnames';
import Navbar from './Navbar';
import Hamburger from './Hamburger';
import Sidebar from './Sidebar';

const Header = () => {
  const [sidebar, setSidebar] = useState(false);

  useEffect(() => {
    if (!sidebar) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebar(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebar]);

  return (
    <div className="w-full bg-transparent">
      <div
        className={cx('bg-black/70 w-full h-full transition-all duration-300 ease-in-out', {
          'block z-10': sidebar,
          hidden: !sidebar,
        })}
        onClick={() => setSidebar(!sidebar)}
      />
      <Navbar />
      <Hamburger sidebar={sidebar} toggle={setSidebar} />
      <Sidebar sidebar={sidebar} toggle={() => setSidebar(!sidebar)} />
    </div>
  );
};

export default Header;
