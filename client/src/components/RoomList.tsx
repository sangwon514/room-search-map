import type { Room } from "@/types/Room";

interface RoomListProps {
  rooms: Room[];
  selectedRooms?: Room[] | null;
  onClearSelection?: () => void;
}

function RoomList({ rooms, selectedRooms, onClearSelection }: RoomListProps) {
  const displayRooms = selectedRooms?.length ? selectedRooms : rooms;

  const openDetailPage = (rid: number) => {
    window.open(`https://33m2.co.kr/room/detail/${rid}`, "_blank");
  };

  return (
    <div className="space-y-4 p-4">
      {selectedRooms && selectedRooms.length > 0 && onClearSelection && (
        <button
          className="mb-2 px-4 py-2 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition"
          onClick={onClearSelection}
        >
          ← 전체 보기
        </button>
      )}

      {displayRooms.map((room) => (
        <div
          key={room.rid}
          onClick={() => openDetailPage(room.rid)}
          className="flex items-center space-x-4 p-3 rounded-lg border bg-white shadow-sm transition hover:shadow-md cursor-pointer"
        >
          <img
            src={`https://d1pviohoskiraj.cloudfront.net/${room.pic_main}?b=samsamm2&d=240x240`}
            alt="room"
            className="w-28 h-28 object-cover rounded-md shrink-0"
          />
          <div className="flex flex-col justify-between text-left w-full">
            <h3 className="text-base font-semibold text-gray-800">{room.room_name}</h3>
            <p className="text-sm text-gray-500">{room.addr_street}</p>
            <p className="text-lg font-bold text-black">
              {room.using_fee.toLocaleString()}원{" "}
              <span className="text-sm font-normal text-gray-500">/ 1주</span>
            </p>
            <p className="text-sm text-gray-500">
              방 {room.room_cnt} · 화장실 {room.bathroom_cnt} · 거실 {room.sittingroom_cnt} · 주방 {room.cookroom_cnt}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RoomList;
