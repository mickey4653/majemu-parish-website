'use client';

interface TagProps {
  text: string;
  icon?: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
}

export default function Tag({ 
  text, 
  icon = "🔥", 
  bgColor = "#CCD9DB",
  textColor = "#0F1415",
  className = ""
}: TagProps) {
  return (
    <div 
      className={`inline-block backdrop-blur-sm px-6 py-3 rounded-full ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <p 
        className="text-sm font-medium"
        style={{ color: textColor }}
      >
        {icon} {text}
      </p>
    </div>
  );
} 