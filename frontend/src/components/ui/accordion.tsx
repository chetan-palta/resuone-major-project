import * as React from "react"

const AccordionContext = React.createContext<{
  activeItem: string | null;
  toggleItem: (value: string) => void;
} | null>(null);

const Accordion = ({ children, collapsible, className }: { children: React.ReactNode, type?: string, collapsible?: boolean, className?: string }) => {
  const [activeItem, setActiveItem] = React.useState<string | null>(null);
  
  const toggleItem = (value: string) => {
    setActiveItem(prev => (prev === value && collapsible) ? null : value);
  };

  return (
    <AccordionContext.Provider value={{ activeItem, toggleItem }}>
      <div className={`w-full ${className || ""}`}>{children}</div>
    </AccordionContext.Provider>
  );
};

const AccordionItemContext = React.createContext<{
  value: string;
} | null>(null);

const AccordionItem = ({ value, children, className }: { value: string, children: React.ReactNode, className?: string }) => {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={`border-b ${className || ""}`}>{children}</div>
    </AccordionItemContext.Provider>
  );
};

const AccordionTrigger = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);
  
  if (!context || !itemContext) return null;

  return (
    <button 
      onClick={() => context.toggleItem(itemContext.value)}
      className={`flex w-full py-4 text-left font-medium transition-all hover:underline ${className || ""}`}
    >
       {children}
    </button>
  );
};

const AccordionContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);
  
  if (!context || !itemContext) return null;
  
  const isOpen = context.activeItem === itemContext.value;

  return (
    <div className={`overflow-hidden text-sm transition-all pb-4 ${isOpen ? "block" : "hidden"} ${className || ""}`}>
      {children}
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
