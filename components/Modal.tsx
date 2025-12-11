import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className="max-w-[300px] md:max-w-[400px] max-h-[85vh] scrollbar-hide overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <div>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
