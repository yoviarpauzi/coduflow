import { useDroppable } from "@dnd-kit/core";

const DroppableColumnBody = ({
  columnId,
  children,
}: {
  columnId: string;
  children: React.ReactNode;
}) => {
  const { setNodeRef } = useDroppable({ id: `droppable-${columnId}` });
  return (
    <div ref={setNodeRef} className="flex flex-col gap-2 min-h-25 flex-1">
      {children}
    </div>
  );
};

export default DroppableColumnBody;
