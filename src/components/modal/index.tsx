import { type FunctionComponent } from "react";
import { api } from "~/utils/api";

type ModalProps = {
  onClose: () => void;
  roomName: string;
};

const Modal: FunctionComponent<ModalProps> = ({ onClose, roomName }) => {
  const handleOnClose = (element: HTMLDivElement) => {
    if (element.id === "container") onClose();
  };
  const { data, error, isLoading } = api.rooms.getRoomSummary.useQuery({
    roomName,
  });

  return (
    <div
      id="container"
      onClick={(e) => handleOnClose(e.target as HTMLDivElement)}
      className="fixed inset-0 z-50 flex justify-center overflow-y-scroll bg-black bg-opacity-70 p-1 backdrop-blur-lg md:p-5 "
    >
      {}
    </div>
  );
};

export default Modal;
