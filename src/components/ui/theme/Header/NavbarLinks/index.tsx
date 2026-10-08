import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import cx from 'classnames';
import ToggleTheme from 'components/ui/theme/Header/ToggleTheme';

type NavbarLinksProps = {
  desktop?: boolean;
};

const subscribe = () => () => {};

const NavbarLinks = ({ desktop }: NavbarLinksProps) => {
  const hasMounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <div
      className={cx({
        'items-center hidden lg:flex': desktop,
        'p-12 flex flex-col': !desktop,
      })}
    >
      <Link href="/#about" className="text-black mb-4 lg:mb-0 mr-0 lg:mr-4 dark:text-white lg:dark:text-black">About</Link>
      <Link href="/#projects" className="text-black mb-4 lg:mb-0 mr-0 lg:mr-4 dark:text-white lg:dark:text-black">Projects</Link>
      <Link href="/#contact" className="text-black mb-4 lg:mb-0 mr-0 lg:mr-4 dark:text-white lg:dark:text-black">Contact</Link>
      {hasMounted && <ToggleTheme />}
    </div>
  );
};

export default NavbarLinks;
