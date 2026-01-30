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
      <div className="loader-text">LGT.</div>
      <div className="loader-bar">
        <div className="loader-progress"></div>
      </div>
    </div>
  );
};

export default Loader;
