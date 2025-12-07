import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  onClick,
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden transition-all duration-200 active:scale-95 font-sans font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-macaron-pink text-macaron-textMain hover:bg-macaron-pinkDark hover:text-white shadow-sm hover:shadow-md",
    secondary: "bg-macaron-green text-macaron-textMain hover:brightness-95 shadow-sm",
    outline: "border-2 border-macaron-pink text-macaron-textMain hover:bg-macaron-pink/10"
  };

  const handleJellyClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    btn.classList.remove('animate-jelly');
    // Trigger reflow
    void btn.offsetWidth; 
    btn.classList.add('animate-jelly');
    
    if (onClick) onClick(e);
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleJellyClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
