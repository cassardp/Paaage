import { createPortal } from 'react-dom';

interface FormField {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    optional?: boolean;
    autoFocus?: boolean;
}

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title?: string;
    submitLabel: string;
    fields: FormField[];
    isDark?: boolean;
}

export function FormModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    submitLabel,
    fields,
    isDark = true,
}: FormModalProps) {
    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSubmit();
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className={`rounded-xl shadow-2xl w-80 overflow-hidden ${isDark ? 'bg-neutral-900/80 backdrop-blur-xl' : 'bg-white/90 backdrop-blur-xl'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - only show if title is provided */}
                {title && (
                    <div className={`px-5 py-4 border-b ${isDark ? 'border-neutral-700/50' : 'border-neutral-200'}`}>
                        <h3 className={`text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                            {title}
                        </h3>
                    </div>
                )}

                {/* Form */}
                <div className={`px-5 space-y-4 ${title ? 'py-4' : 'pt-5 pb-4'}`}>
                    {fields.map((field, index) => (
                        <div key={index}>
                            <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                {field.label}
                                {field.optional && (
                                    <span className={isDark ? 'text-neutral-500' : 'text-neutral-400'}> (optional)</span>
                                )}
                            </label>
                            <input
                                type="text"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                placeholder={field.placeholder}
                                autoFocus={field.autoFocus}
                                className={`w-full px-0 py-2 bg-transparent border-b text-sm transition-colors
                ${isDark ? 'border-neutral-700 text-neutral-200 placeholder-neutral-500 focus:border-neutral-500' : 'border-neutral-200 text-neutral-700 placeholder-neutral-400 focus:border-neutral-400'}
                focus:outline-none`}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className={`px-5 py-4 border-t ${isDark ? 'border-neutral-700/50' : 'border-neutral-200'}`}>
                    <button
                        onClick={onSubmit}
                        className={`w-full py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all
            ${isDark ? 'bg-neutral-700 hover:bg-neutral-500 text-neutral-200' : 'bg-neutral-700 hover:bg-neutral-500 text-white'}`}
                    >
                        {submitLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
