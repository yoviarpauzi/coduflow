import { useDroppable } from "@dnd-kit/core";

const DroppableStatusBody = ({
  statusId,
  children,
}: {
  statusId: string;
  children: React.ReactNode;
}) => {
  const { setNodeRef } = useDroppable({ id: `droppable-${statusId}` });
  return (
    <div ref={setNodeRef} className="flex flex-col gap-2 min-h-25 flex-1">
      {children}
    </div>
  );
};

export default DroppableStatusBody;
