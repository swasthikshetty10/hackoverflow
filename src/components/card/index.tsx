import React, { useState } from "react";
import Modal from "../modal";

function Card({
  room,
}: {
  room: {
    name: string;
    slug: string | null;
    createdAt: Date;
  };
}) {
  const [modal, setModal] = useState(false);
  return (
    <div>
      <div key={room.name}>
        {room.slug || room.name}
        <button onClick={() => setModal(true)}>Summary</button>
        {modal && (
          <Modal roomName={room.name} onClose={() => setModal(false)}></Modal>
        )}
      </div>
    </div>
  );
}

export default Card;
