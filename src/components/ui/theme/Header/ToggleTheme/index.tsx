import { useTheme } from 'next-themes';
import Sun from 'components/ui/Icons/Sun';
import Moon from 'components/ui/Icons/Moon';

const ToggleTheme = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      className="text-left lg:text-center bg-none border-none cursor-pointer transition-all duration-300 focus:transition-all focus:duration-300"
      type="button"
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="text-black dark:text-white lg:dark:text-black" />
      ) : (
        <Moon className="text-black dark:text-white lg:dark:text-black" />
      )}
    </button>
  );
};

export default ToggleTheme;
