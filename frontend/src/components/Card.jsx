export default function Card({children, title, className = ""}) {
    return (
        <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
            {title && (
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-800">{title}</h3>
                </div>
            )}
            <div className="p-5">
                {children}
            </div>
        </div>
    );
}