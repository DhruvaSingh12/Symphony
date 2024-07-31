import * as Dialog from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onChange: (open: boolean) => void;
  title: string;
  description: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onChange,
  title,
  description,
  children,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onChange} defaultOpen={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-neutral-900/70 backdrop-blur-sm fixed inset-0 transition-opacity duration-300" />
        <Dialog.Content className="fixed drop-shadow-lg border overflow-y-auto border-neutral-800 top-[50%] left-[50%] max-h-full h-full md:h-auto md:max-h-[85vh] w-full md:w-[90vw] md:max-w-[500px] transform -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black p-6 focus:outline-none transition-transform duration-300">
          <Dialog.Title className="text-2xl font-bold text-center mb-4 text-white">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mb-5 text-md leading-normal text-center text-neutral-100">
            {description}
          </Dialog.Description>
          <div>{children}</div>
          <Dialog.Close asChild>
            <button className="text-gray-100 hover:text-gray-500 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:outline-none">
              <IoMdClose size={20} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
