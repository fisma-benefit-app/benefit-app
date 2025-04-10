import useTranslations from "../hooks/useTranslations";

interface ConfirmProps {
    open: boolean;
    message: string;
    onConfirm: () => void;
    setOpen: (open: boolean) => void;
}

export default function ConfirmModal({message, open, setOpen, onConfirm}: ConfirmProps) {

    const translation = useTranslations().confirmModal;

    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-[4px]">
            <div className="bg-fisma-blue p-4 shadow-2xl lg w-96">
                <h2 className="text-white text-2xl font-medium text-center bg-fisma-dark-blue mb-4 -mx-4 -mt-4 px-4 py-2">
                    {message}
                </h2>
                <div className="flex justify-evenly items-center">
                    <button
                    type="button"
                    onClick={()=> setOpen(false)}
                    className="w-30 text-white bg-fisma-dark-blue hover:brightness-70 disabled:brightness-70 p-2"
                    >
                    {translation.cancel}
                    </button>
                    <button
                    type="button"
                    onClick={() => {onConfirm(); setOpen(false)}}
                    className="w-30 text-white bg-fisma-dark-blue hover:brightness-70 disabled:brightness-70 p-2"
                    >
                    {translation.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
}