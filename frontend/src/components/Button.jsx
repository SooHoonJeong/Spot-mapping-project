export default function Button({children, onClick, variant = "primary", className = ""}) {
    // Base Style
    const baseStyles = "px-4, py-2 rounded-lg font-medium transition-all focus:outline-none";

    const variants = {
        praimary: "bg-blue-600 text-white hover:bg-blue-700 active:scale-95",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    
    }
    return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
        {children}
    </button>
    );
}