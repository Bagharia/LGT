import { useEffect, useState } from 'react';

const Loader = ({ onLoadComplete }) => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(true);
      if (onLoadComplete) onLoadComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onLoadComplete]);

  return (
    <div className={`loader ${hidden ? 'hidden' : ''}`}>
      <img src="/logo-removebg-preview.png" alt="LGT" className="loader-logo" />
      <div className="loader-bar">
        <div className="loader-progress"></div>
      </div>
    </div>
  );
};

export default Loader;
