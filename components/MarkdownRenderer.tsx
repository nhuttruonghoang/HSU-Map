import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Simple replacement for newlines to breaks and bold text for basic markdown.
  // In a production app, use a library like 'react-markdown'.
  // This is a lightweight implementation to avoid external heavy deps for this demo.
  
  const processText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Bold **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="mb-2 text-slate-700 leading-relaxed">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return <div className="prose prose-slate max-w-none">{processText(content)}</div>;
};

export default MarkdownRenderer;
